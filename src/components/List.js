import React, { Component } from 'react';
import Place from './Place';

class List extends Component {
  state = {
    locations: '',
    query: '',
    suggestions: true
  };

  constructor(props) {
    super(props);
    this.filterLocations = this.filterLocations.bind(this);
  }

  // Filter Locations based on user input
  filterLocations(event) {
    this.props.closeInfoWindow();
    const { value } = event.target;
    let locations = [];
    this.props.places.forEach((location) => {
      if (location.locName.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        location.marker.setVisible(true);
        locations.push(location);
      }
      else
      {
        location.marker.setVisible(false);
      }
    });

    this.setState({
      locations: locations,
      query: value
    });
  }

  componentWillMount() {
    this.setState({
      locations: this.props.places
    });
  }

  render() {
    let locationlist = this.state.locations.map((listItem, index) => {
      return (
        <Place
          key={index}
          openInfoWindow={this.props.openInfoWindow.bind(this)}
          data={listItem}
        />
      );
    }, this);

    return (
      <div className="search-area">
        <input
          className="search-input"
          role="search"
          aria-labelledby="filter"
          type="text"
          placeholder="Search local attractions"
          value={this.state.query}
          onChange={this.filterLocations}
        />
        <ul className="location-list">
          {locationlist}
        </ul>
      </div>
    );
  }
}

export default List;