/* Name: App.js
** Date: 25th July 2018
** Project: FEND - Neighborhood Map
** Author: Colin Ashley
*/



// import React
import React, { Component } from 'react';
// import required components
import './App.css';
import List from './components/List';

class App extends Component {
  state = {
    // read in list of places
    places: require('./places.json'),
    map: '',
    infoWindow: '',
    lastMarker: ''
  };

  constructor(props) {
    super(props);
    // Keep objects locally accessible
    this.initMap = this.initMap.bind(this);
    this.openInfoWindow = this.openInfoWindow.bind(this);
    this.closeInfoWindow = this.closeInfoWindow.bind(this);
  }

  componentDidMount() {
    // initMap is the main window
    window.initMap = this.initMap;
    // Load map (aysnc)
    setupMap(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiqg9YTYOm1Z3CVDUCHWmDEjRqIlBocj8&v=3&callback=initMap"
    );
  }

  // Init the Map, Infowindow, event-listeners and markers
  initMap() {
    let self = this;
    let mapView = document.getElementById('map');
    mapView.style.height = window.innerHeight + 'px';
    // create the map
    let map = new window.google.maps.Map(mapView, {
      mapTypeControlOptions: {
              style: window.google.maps.MapTypeControlStyle.DEFAULT,
              position: window.google.maps.ControlPosition.BOTTOM_CENTER
          },
      center: { lat: 51.886225, lng: -1.7582386 },
      zoom: 15
    });
    // create the infoWindow
    let InfoWindow = new window.google.maps.InfoWindow({});
    let places = [];
    // close-click event listener
    window.google.maps.event.addListener(InfoWindow, 'closeclick', () => {
      self.closeInfoWindow();
    });

    // update the state
    this.setState({
      map: map,
      infoWindow: InfoWindow
    });

    // keep map centered
    window.google.maps.event.addDomListener(window, 'resize', () => {
      let center = map.getCenter();
      window.google.maps.event.trigger(map, 'resize');
      self.state.map.setCenter(center);
    });

    // close the infoWindow if the user clicks the map too
    window.google.maps.event.addListener(map, 'click', () => {
      self.closeInfoWindow();
    });

    // create the location markers
    this.state.places.forEach((location) => {
      let locName = location.name;
      let marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(
          location.lat,
          location.lng,
        ),
        animation: window.google.maps.Animation.DROP,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          strokeWeight: 1,
          scale: 6.0,
          fillColor: 'Red',
          fillOpacity: 0.7
          },
        title: location.name
      });
      // create eventListener for marker clicks
      marker.addListener('click', () => {
        self.openInfoWindow(marker);
      });

      // setup marker
      location.locName = locName;
      location.marker = marker;
      location.display = true;
      places.push(location);
    });

    // update the state
    this.setState({
      places: places
    });
  }

  // Open nfoWindow for marker
  openInfoWindow(marker) {
    // close current window first
    this.closeInfoWindow();
        this.setState({
      lastMarker: marker
    });
    // Animate the selected marker
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    this.state.infoWindow.setContent('Please Wait');
    this.state.infoWindow.open(this.state.map, marker);
    // Use 3rd-Party API for place data
    this.getFourSqData(marker);
  }

  // Closes infoWindow
  closeInfoWindow() {
    if (this.state.lastMarker) {
      this.state.lastMarker.setAnimation(null);
    }
    this.setState({
      lastMarker: ''
    });

    this.state.infoWindow.close();
  }

  // get more data from 3rd-Party via API
  getFourSqData(marker) {
    let self = this;
    // My FourSquare Client Details
    let FSclientId = "U0A0LA1YGIBAK5OTFXCBMD2PUZ13BNWJSRK5E2YUSPYC30OY";
    let FSclientSecret = "ZC3N35W00CVCA3ZNCYSPYL2DFCUVDBH1NC3W0O0PBHBVYISN";
    // Latest Version
    let FSVersion = "20180721";

    // construct the API call
    let url =
    'https://api.foursquare.com/v2/venues/search?client_id=' + FSclientId + '&client_secret=' +
      FSclientSecret + '&v=' + FSVersion + '&ll=' + marker.getPosition().lat() + ',' +
      marker.getPosition().lng() + '&limit=1';

    // Get the data
    fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          self.state.infoWindow.setContent('Server-side problem encountered');
          return;
        }
        // read response and write infoWindow HTML
        response.json().then((data) => {
          let location_data = data.response.venues[0];
          let place = `<h4>${location_data.name}</h4>`;
          let category = `<p class=category>(${location_data.categories[0].name})</p>`;
          let addln1 = `<ul class="addressList"><li>${location_data.location.formattedAddress[0]}</li>`;
          let addln2 = `<li>${location_data.location.formattedAddress[1]}</li>`;
          let postcode = `<li>${location_data.location.postalCode}</li></ul></p>`;
          // Unfortunately Photos are not available via FourSquare API search
          let more =
            '<a href="https://foursquare.com/v/' + location_data.id +
            '" target="_blank"><b>View on FourSquare</b></a>';
          // Write to the infoWindow
          self.state.infoWindow.setContent( place + category + addln1 + addln2 + postcode + more );
          //console.log(location_data);
        });
      })
      .catch((err) => {
        self.state.infoWindow.setContent('<h4>Error connecting to FourSquare</h4>Check Network Connection');
      });
  }

  // Render the screen
  render() {
    return (
      <div>
        <header className="app-header">
          <h1 className="app-title">Cotswold Visitor Guide</h1>
        </header>
        <List
          key = "10"
          places = {this.state.places}
          openInfoWindow = {this.openInfoWindow}
          closeInfoWindow = {this.closeInfoWindow}
        />
      <div id="map" />
      </div>
    );
  }
}

export default App;

// Create an HTML <script> element to load the Map
function setupMap(mapURL) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');
  script.src = mapURL;
  script.async = true;
  script.onerror = () => {
    document.write('Failed to load Google Map');
  };
  ref.parentNode.insertBefore(script, ref);
}
