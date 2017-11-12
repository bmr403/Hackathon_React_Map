import React, { Component } from 'react'
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import API from '../../api/API'
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server'
/* import MapData from '../../../data.json'; */
import invariant from 'invariant';

 const style = {
  width: '80%',
  height: '80%',
  position: 'relative'
}

const mapStyles = {
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
};

const evtNames = [
  'ready',
  'click',
  'dragend',
  'recenter',
  'bounds_changed',
  'center_changed',
  'dblclick',
  'dragstart',
  'heading_change',
  'idle',
  'maptypeid_changed',
  'mousemove',
  'mouseout',
  'mouseover',
  'projection_changed',
  'resize',
  'rightclick',
  'tilesloaded',
  'tilt_changed',
  'zoom_changed',
  'onInfoWindowClose',
  'getInitialState',
  'onMarkerClick'
];
 
 
 Map.propTypes = {
  google: PropTypes.object,
  zoom: PropTypes.number,
  centerAroundCurrentLocation: PropTypes.bool,
  center: PropTypes.object,
  initialCenter: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
  containerStyle: PropTypes.object,
  visible: PropTypes.bool,
  mapType: PropTypes.string,
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number,
  clickableIcons: PropTypes.bool,
  disableDefaultUI: PropTypes.bool,
  zoomControl: PropTypes.bool,
  mapTypeControl: PropTypes.bool,
  scaleControl: PropTypes.bool,
  streetViewControl: PropTypes.bool,
  panControl: PropTypes.bool,
  rotateControl: PropTypes.bool,
  scrollwheel: PropTypes.bool,
  draggable: PropTypes.bool,
  keyboardShortcuts: PropTypes.bool,
  disableDoubleClickZoom: PropTypes.bool,
  noClear: PropTypes.bool,
  styles: PropTypes.array,
  gestureHandling: PropTypes.string,
  onInfoWindowClose: PropTypes.func,
  getInitialState: PropTypes.func,
  onMarkerClick: PropTypes.func,
  onMove: React.PropTypes.func
};

Map.defaultProps = {
  zoom: 10,
  initialCenter: {
    lat: 13.0827,
    lng: 80.2707
  },
  center: {},
  centerAroundCurrentLocation: true,
  style: {},
  containerStyle: {},
  visible: true
  
};



export class MapContainer extends Component {
	constructor(props){
    super(props);
    this.state = {
		showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
	  customers: {}
    }
  }
  
  setUserState(){
    API.getCustomers().then(customers =>{
      this.setState({
        customers: customers.data
      })
    })
  }
  
  componentDidMount() {
	this.setUserState();
    if (this.props.centerAroundCurrentLocation) {
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const coords = pos.coords;
                this.setState({
                    currentLocation: {
                        lat: coords.latitude,
                        lng: coords.longitude
                    }
                })
            })
        }
    }
    this.loadMap();
  }
	
	componentDidUpdate(prevProps, prevState) {
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    if (this.props.visible !== prevProps.visible) {
      this.restyleMap();
    }
    if (this.props.zoom !== prevProps.zoom) {
      this.map.setZoom(this.props.zoom);
    }
    if (this.props.center !== prevProps.center) {
      this.setState({
        currentLocation: this.props.center
      });
    }
    if (prevState.currentLocation !== this.state.currentLocation) {
      this.recenterMap();
    }
	if (this.props.map !== prevProps.map) {
      this.renderInfoWindow();
    }
	
	if (this.props.children !== prevProps.children) {
      this.props.visible ? this.openWindow() : this.closeWindow();
    }
	if ((this.props.visible !== prevProps.visible) ||
        (this.props.marker !== prevProps.marker)) {
      this.props.visible ?
        this.openWindow() :
        this.closeWindow();
    }
	
  }
  
  onOpen() {
    if (this.props.onOpen) this.props.onOpen();
  }

  onClose() {
    if (this.props.onClose) this.props.onClose();
  }
  
  openWindow() {
    this.infowindow
      .open(this.props.map, this.props.marker);
  }
  closeWindow() {
    this.infowindow.close();
  }
  
  updateContent() {
    const content = this.renderChildren();
    this.infowindow
      .setContent(content);
  }
  
   renderInfoWindow() {
    let {map, google, mapCenter} = this.props;

    const iw = this.infowindow = new google.maps.InfoWindow({
      content: 'Hackathon Data is :'
    });
	google.maps.event
      .addListener(iw, 'closeclick', this.onClose.bind(this))
    google.maps.event
      .addListener(iw, 'domready', this.onOpen.bind(this));
  }

  recenterMap() {
    const map = this.map;
    const curr = this.state.currentLocation;

    const google = this.props.google;
    const maps = google.maps;

    if (map) {
        let center = new maps.LatLng(curr.lat, curr.lng)
        map.panTo(center)
    }
  }
  
  componentWillUnmount() {
    const {google} = this.props;
    if (this.geoPromise) {
      this.geoPromise.cancel();
    }
    Object.keys(this.listeners).forEach(e => {
      google.maps.event.removeListener(this.listeners[e]);
    });
  }
  
  loadMap() {
     const {google} = this.props;
      const maps = google.maps;
	  
      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);
      const curr = this.state.currentLocation;
      const center = new maps.LatLng(curr.lat, curr.lng);

      const mapTypeIds = this.props.google.maps.MapTypeId || {};
      const mapTypeFromProps = String(this.props.mapType).toUpperCase();

      const mapConfig = Object.assign(
        {},
        {
          mapTypeId: mapTypeIds[mapTypeFromProps],
          center: center,
          zoom: this.props.zoom,
          maxZoom: this.props.maxZoom,
          minZoom: this.props.maxZoom,
          clickableIcons: !!this.props.clickableIcons,
          disableDefaultUI: this.props.disableDefaultUI,
          zoomControl: this.props.zoomControl,
          mapTypeControl: this.props.mapTypeControl,
          scaleControl: this.props.scaleControl,
          streetViewControl: this.props.streetViewControl,
          panControl: this.props.panControl,
          rotateControl: this.props.rotateControl,
          scrollwheel: this.props.scrollwheel,
          draggable: this.props.draggable,
          keyboardShortcuts: this.props.keyboardShortcuts,
          disableDoubleClickZoom: this.props.disableDoubleClickZoom,
          noClear: this.props.noClear,
          styles: this.props.styles,
          gestureHandling: this.props.gestureHandling
        }
      );

      Object.keys(mapConfig).forEach(key => {
        // Allow to configure mapConfig with 'false'
        if (mapConfig[key] === null) {
          delete mapConfig[key];
        }
      });

      this.map = new maps.Map(node, mapConfig);

      evtNames.forEach(e => {
        this.listeners[e] = this.map.addListener(e, this.handleEvent(e));
      });
      maps.event.trigger(this.map, 'ready');
      this.forceUpdate();
    }
	
	
	handleEvent(evtName) {
    let timeout;
    const handlerName = `on${camelize(evtName)}`;

    return e => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        if (this.props[handlerName]) {
          this.props[handlerName](this.props, this.map, e);
        }
      }, 0);
    };
  }
	
  onMapClick() {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  }
  
  restyleMap() {
    if (this.map) {
      const {google} = this.props;
      google.maps.event.trigger(this.map, 'resize');
    }
  }
  
  renderChildren() {
    const {children} = this.props;

    if (!children) return;

    return React.Children.map(children, c => {
      if (!c) return;
      return React.cloneElement(c, {
        map: this.map,
        google: this.props.google,
        mapCenter: this.state.currentLocation
      });
    });
	
    return ReactDOMServer.renderToString(children);
  }
  
  renderMarkers() {
	
	return  Object.entries(this.state.customers).map(([index, customer]) => {
      return <Marker key={customer.id}
                name={customer.firstName}
                marker={customer}
                position={{lat: customer.lat, lng: customer.lng}}
              />
    })
  }
  
  onInfoWindowClose(){
    this.setState({
      showingInfoWindow: false,
      activeMarker: null
    })
  }
  
  onMarkerClick(props, marker, e) {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

render() {
	 const style = Object.assign({}, mapStyles.map, this.props.style, {
      display: this.props.visible ? 'inherit' : 'none'
    });

    const containerStyles = Object.assign(
      {},
      mapStyles.container,
      this.props.containerStyle
    );
    return (
	<div style={containerStyles} className={this.props.className}>
        <div style={style} ref="map">
          Loading map...
        </div>
        {this.renderChildren()}
		<Map google={this.props.google} 
	  style={style} 
		className={'main'}
		onClick={this.onMapClick} 
	  zoom={10}>
	{this.renderMarkers()}
      </Map>
		
      </div>
	
	
	  
    );
  }
}


evtNames.forEach(e => (Map.propTypes[e] = PropTypes.func));

export const camelize = function(str) {
  return str.split(' ').map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');
}

export default GoogleApiWrapper({
	//your API key goes here
  apiKey: 'AIzaSyA4SqALhZOzZV8-yijgOGEO6mbBM1xvaT0'
})(MapContainer) 
