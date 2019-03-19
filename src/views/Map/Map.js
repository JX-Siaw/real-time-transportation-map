import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import worldGeoJSON from 'geojson-world-map';

import './Map.css';

export default class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lat: -37.814,
            lng: 144.96332,
            zoom: 12,
        };
    }


    render() {
        const position = [this.state.lat, this.state.lng];
        return (
            <LeafletMap center={position} zoom={this.state.zoom}>
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    url='https://maps.tilehosting.com/styles/basic/{z}/{x}/{y}.png?key=ljh1rAY6bM1lt0B7oi6Y'
                />
                <Marker position={[this.state.lat, this.state.lng]} />
            </LeafletMap>
        );
    }
}