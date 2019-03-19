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
            zoom: 13,
        };
    }


    render() {
        const position = [this.state.lat, this.state.lng];
        return (
            <LeafletMap center={position} zoom={this.state.zoom} timeout={1000000}>
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    url='https://maps.tilehosting.com/styles/darkmatter/{z}/{x}/{y}.png?key=ljh1rAY6bM1lt0B7oi6Y'
                />
                <TileLayer
                    attribution='<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap'
                    url='http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'
                />
                <Marker position={[this.state.lat, this.state.lng]} />
            </LeafletMap>
        );
    }
}