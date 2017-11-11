import React, { Component } from 'react'
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import API from '../../api/API'
import MapData from '../../../data.json';
import invariant from 'invariant';

 const style = {
  width: '80%',
  height: '80%',
  position: 'relative'
}

export class MapContainer extends Component {
	constructor(props){
    super(props);
    this.state = {
		 markers: MapData.markers
    }
  }
	renderMarkers() {
    return MapData.markers.map(marker =>{
      return <Marker key={marker.name}
                name={marker.name}
                marker={marker}
                position={{lat: marker.lat, lng: marker.lng}}
              />
    })
  }
	
	
render() {
    return (
	<Map google={this.props.google} 
	  style={style}  
	initialCenter={{
            lat: 12.8929388,
            lng: 79.7470399
          }}  
		className={'main'}
	  zoom={10}>
			
	{this.renderMarkers()}
      </Map>
	  
    );
  }
}

export default GoogleApiWrapper({
	//your API key goes here
  apiKey: 'AIzaSyA4SqALhZOzZV8-yijgOGEO6mbBM1xvaT0'
})(MapContainer) 
