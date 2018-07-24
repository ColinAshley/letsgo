/* Name: map.js
** Date: 20th July 2018
** Desc: init and render the Google map.
*/

// import React
import React, { Component } from 'react';

class Map extends Component {
    state = {
    places: require('../places.json'),
    map: '',
    infoWindow: ''
  };

  constructor(props) {
    super(props);
    // Keep local instance
    this.initMap = this.initMap.bind(this);
  }

  componentDidMount() {
    // Make this.initMap() available globally in the window
    window.initMap = this.initMap;
    // Load the Map Async
    loadMapJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiqg9YTYOm1Z3CVDUCHWmDEjRqIlBocj8&v=3&callback=initMap"
    );
  }

  initMap() {
    let mapView = document.getElementById('map');
    mapView.style.height = window.innerHeight + 'px';
    mapView.style.height = '600px';  let map = new window.google.maps.Map(mapView, {
      center: { lat: 51.883955, lng: -1.758059 },
      zoom: 15
    });
    let InfoWindow = new window.google.maps.InfoWindow({});

    window.google.maps.event.addListener(InfoWindow, 'closeclick', () => {
      this.closeInfoWindow();
    });

    this.setState({
      map: map,
      infoWindow: InfoWindow
    });

    window.google.maps.event.addListener(map, 'click', () => {
      this.closeInfoWindow();
    });

    let places = [];
    this.state.places.forEach((location) => {
      let locname = location.name;
      let marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(
          location.lat,
          location.lng
        ),
        animation: window.google.maps.Animation.DROP,
        map: map
      });

      marker.addListener('click', () => {
        this.openInfoWindow(marker);
      });

      location.name = locname;
      location.marker = marker;
      location.display = true;
      places.push(location);
    });

    this.setState({
      places: places
    });
  }

  openInfoWindow(marker) {
    this.closeInfoWindow();
    this.state.infoWindow.open(this.state.map, marker);
    this.getFSDetails(marker);
  }

  closeInfoWindow() {
    this.state.infoWindow.close();
  }

  getFSDetails(marker) {
  let self = this;

  // FourSquare Client Details
  let FSclientId = "U0A0LA1YGIBAK5OTFXCBMD2PUZ13BNWJSRK5E2YUSPYC30OY";
  let FSclientSecret = "ZC3N35W00CVCA3ZNCYSPYL2DFCUVDBH1NC3W0O0PBHBVYISN";
  let FSVersion = "20180721";

  // Construct target API endpoint
  let url =
    'https://api.foursquare.com/v2/venues/search?client_id=' +
    FSclientId + '&client_secret=' + FSclientSecret + '&v=' + FSVersion + '&ll=' +
    marker.getPosition().lat() + ',' + marker.getPosition().lng() + '&limit=1';

  fetch(url)
    .then((response) => {
      if (response.status !== 200) {
        self.state.infoWindow.setContent('FourSquare connection timeout)');
        return;
      }

      // Grab returned data
      response.json().then((data) => {
        let location_data = data.response.venues[0];
        let place = `<h4>${location_data.name}</h4>`;
        let street = `<p>${location_data.location.formattedAddress[0]}</p>`;
        let city = `<p>${location_data.location.formattedAddress[1]}</p>`;

        let readMore =
          '<a href="https://foursquare.com/v/' +
          location_data.id +
          '" target="_blank">View on Foursquare</a>';
        self.state.infoWindow.setContent(
          place + street + city + readMore
        );
      });
    })
    .catch((err) => {
      self.state.infoWindow.setContent('Failed to collect FourSquare Data)');
    });
}

  // Display the map
  render () {
    return(
      <div id="map">
      </div>
    );
  }
}
export default Map;

function loadMapJS(src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');
  script.src = src;
  script.async = true;
  script.onerror = () => {
    document.write('Failed to load Google Maps');
  };
  ref.parentNode.insertBefore(script, ref);
}