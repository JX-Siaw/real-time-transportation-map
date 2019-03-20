import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import worldGeoJSON from 'geojson-world-map';

import './Map.css';

export default class Map extends Component {
    mapRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            lat: -37.814,
            lng: 144.96332,
            zoom: 13,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.mapRef.current) {
                console.log("Update");
                this.mapRef.current.leafletElement.invalidateSize();
            }
        }, 10000);
    }


    render() {
        const position = [this.state.lat, this.state.lng];
        return (
            <LeafletMap ref={this.mapRef} center={position} zoom={this.state.zoom}>
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
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