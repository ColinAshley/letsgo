import React, { Component } from 'react';
import './App.css';
import List from './components/List';

class App extends Component {
  state = {
    places: require('./places.json'),
    map: '',
    infoWindow: ''
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
    loadMapJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiqg9YTYOm1Z3CVDUCHWmDEjRqIlBocj8&v=3&callback=initMap"
    );
  }

  // Init the Map, Infowindow, event-listeners and markers
  initMap() {
    let self = this;
    let mapView = document.getElementById('map');
    mapView.style.height = window.innerHeight + 'px';
    let map = new window.google.maps.Map(mapView, {
      center: { lat: 51.883955, lng: -1.758059 },
      zoom: 15
    });
    let InfoWindow = new window.google.maps.InfoWindow({});
    let places = [];

    window.google.maps.event.addListener(InfoWindow, 'closeclick', () => {
      self.closeInfoWindow();
    });

    this.setState({
      map: map,
      infoWindow: InfoWindow
    });

    window.google.maps.event.addDomListener(window, 'resize', () => {
      let center = map.getCenter();
      window.google.maps.event.trigger(map, 'resize');
      self.state.map.setCenter(center);
    });

    window.google.maps.event.addListener(map, 'click', () => {
      self.closeInfoWindow();
    });

    this.state.places.forEach((location) => {
      let nameType = location.name;
      let marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(
          location.lat,
          location.lng
        ),
        animation: window.google.maps.Animation.DROP,
        map: map
      });

      marker.addListener('click', () => {
        self.openInfoWindow(marker);
      });

      location.nameType = nameType;
      location.marker = marker;
      location.display = true;
      places.push(location);
    });

    this.setState({
      places: places
    });
  }

  // Open an infoWindow for marker
  openInfoWindow(marker) {
    // close currect window first
    this.closeInfoWindow();
    this.state.infoWindow.open(this.state.map, marker);
    //this.state.map.setCenter(marker.getPosition());
    this.getFourSqData(marker);
  }

  // Closes infoWindow
  closeInfoWindow() {
    this.state.infoWindow.close();
  }

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

    fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          self.state.infoWindow.setContent('Server-side problem encountered');
          return;
        }
        //
        response.json().then((data) => {
          let location_data = data.response.venues[0];
          let place = `<h4>${location_data.name}</h4>`;
          let addln1 = `<p>${location_data.location.formattedAddress[0]}</p>`;
          let addln2 = `<p>${location_data.location.formattedAddress[1]}</p>`;
          let more =
            '<a href="https://foursquare.com/v/' + location_data.id +
            '" target="_blank"><b>View on FourSquare</b></a>';
          self.state.infoWindow.setContent( place + addln1 + addln2 + more );
        });
      })
      .catch((err) => {
        self.state.infoWindow.setContent('Something went wrong! Try again plz :)');
      });
  }

  /**
   * Render for react
   */
  render() {
    return (
      <div>
        <header className="App-header">
          <div>
            <h1 className="App-title">Neighborhood Map</h1>
          </div>
        </header>
        <List
          key = "15"
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

// Load the google Map
function loadMapJS(src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');
  script.src = src;
  script.async = true;
  script.onerror = () => {
    document.write('Failed to load Google Map');
  };
  ref.parentNode.insertBefore(script, ref);
}