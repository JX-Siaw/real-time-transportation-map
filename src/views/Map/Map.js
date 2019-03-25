import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import worldGeoJSON from 'geojson-world-map';

import './Map.css';

const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

export default class Map extends Component {
    mapRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            lat: -37.814,
            lng: 144.96332,
            zoom: 13,
            departures: {
                toCragieburn: [],
                toCity: [],
            },
        };
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.mapRef.current) {
                console.log("Update");
                this.mapRef.current.leafletElement.invalidateSize();
            }
        }, 10000);

        let now = moment.utc().format();
        const key = 'b4ba8648-d112-4cf5-891d-8533756cef97';
        const id = '3001097';

        // Health check
        const request = '/v2/healthcheck?timestamp=' + now + '&devid=' + id;
        const baseURL = 'https://timetableapi.ptv.vic.gov.au';
        console.log(now);
        const signature = crypto.createHmac('sha1', key).update(request).digest('hex');
        axios.get(baseURL + request + '&signature=' + signature)
            .then(function (response) {
                console.log(response);
            });

        // Kensington Stop Id = 1108
        // Broadmeadows Route Id = 3

        const request2 = '/v3/departures/route_type/0/stop/1108?look_backwards=false&max_results=2&devid=3001097';
        const signature2 = crypto.createHmac('sha1', key).update(request2).digest('hex');
        axios.get(baseURL + request2 + '&signature=' + signature2)
            .then(response => {
                let toCity = [];
                let toCragieburn = [];
                for (let i in response.data.departures) {
                    // To city
                    if (response.data.departures[i].direction_id == 1) {
                        toCity.push(response.data.departures[i]);
                    } else {
                        toCragieburn.push(response.data.departures[i]);
                    }
                }
                this.setState({
                    departures: {
                        toCity: toCity,
                        toCragieburn: toCragieburn
                    }
                });
                console.log(this.state.departures);
            });

        setInterval(() => {
            axios.get(baseURL + request2 + '&signature=' + signature2)
                .then(response => {
                    let toCity = [];
                    let toCragieburn = [];
                    for (let i in response.data.departures) {
                        // To city
                        if (response.data.departures[i].direction_id == 1) {
                            toCity.push(response.data.departures[i]);
                        } else {
                            toCragieburn.push(response.data.departures[i]);
                        }
                    }
                    this.setState({
                        departures: {
                            toCity: toCity,
                            toCragieburn: toCragieburn
                        }
                    });
                    console.log(this.state.departures);
                });
        }, 30000);



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
                <Marker position={[-37.79377775, 144.930527]}>
                    <Popup>
                        <h1>Kensington Station</h1>
                        {
                            this.state.departures.toCity.map((key, index) => {
                                const estimatedTime = moment.utc(this.state.departures.toCity[index].estimated_departure_utc);
                                const now = moment.utc();
                                const difference = estimatedTime.diff(now, 'minutes');
                                return <p>To City: {difference} mins</p>
                            })
                        }
                        {
                            this.state.departures.toCragieburn.map((key, index) => {
                                const estimatedTime = moment.utc(this.state.departures.toCragieburn[index].estimated_departure_utc);
                                const now = moment.utc();
                                const difference = estimatedTime.diff(now, 'minutes');
                                return <p>To Cragieburn: {difference} mins</p>
                            })
                        }
                    </Popup>
                </Marker>
            </LeafletMap>
        );
    }
}