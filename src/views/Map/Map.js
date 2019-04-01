import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
// import worldGeoJSON from 'geojson-world-map';

import './Map.css';

import { railIcon } from '../../components/leaflet-icons/rail-icon/rail-icon';
import { trainIcon } from '../../components/leaflet-icons/train-icon/train-icon';

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
            stops: [],
            departures: [],
            latlngs: []
        };
    }

    compareStops(a, b) {
        const aStopSequence = a.stop_sequence;
        const bStopSequence = b.stop_sequence;

        let comparison = 0;
        if (aStopSequence > bStopSequence) {
            comparison = 1;
        } else if (aStopSequence < bStopSequence) {
            comparison = -1;
        }

        return comparison;
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
        const baseURL = 'http://timetableapi.ptv.vic.gov.au';
        console.log(now);
        const signature = crypto.createHmac('sha1', key).update(request).digest('hex');
        axios.get(baseURL + request + '&signature=' + signature)
            .then(response => {
                console.log(response);
            });

        // Kensington Stop Id = 1108
        // Broadmeadows Route Id = 3    


        // Request to retrieve all the stops for a train line
        const request3 = '/v3/stops/route/3/route_type/0?direction_id=1&devid=3001097';
        const signature3 = crypto.createHmac('sha1', key).update(request3).digest('hex');


        axios.get(baseURL + request3 + '&signature=' + signature3)
            .then(response => {
                this.setState({
                    stops: response.data.stops
                });
                let latlngs = [];
                for (let i in this.state.stops) {
                    const stopID = this.state.stops[i].stop_id;
                    const request4 = '/v3/departures/route_type/0/stop/' + stopID + '/route/3?look_backwards=false&max_results=1&devid=3001097';
                    const signature4 = crypto.createHmac('sha1', key).update(request4).digest('hex');
                    if (i < 2) {
                        latlngs.push([this.state.stops[i].stop_latitude, this.state.stops[i].stop_longitude]);
                    }
                    axios.get(baseURL + request4 + '&signature=' + signature4)
                        .then(response => {
                            this.setState({
                                departures: [...this.state.departures, response.data.departures]
                            });
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
                this.setState({
                    latlngs: latlngs
                });
            })
            .catch(error => {
                console.log(error);
            });

        setInterval(() => {
            axios.get(baseURL + request3 + '&signature=' + signature3)
                .then(response => {
                    this.setState({
                        stops: response.data.stops
                    });
                    this.setState({
                        departures: []
                    });
                    for (let i in this.state.stops) {
                        const stopID = this.state.stops[i].stop_id;
                        const request4 = '/v3/departures/route_type/0/stop/' + stopID + '/route/3?look_backwards=false&max_results=1&devid=3001097';
                        const signature4 = crypto.createHmac('sha1', key).update(request4).digest('hex');
                        axios.get(baseURL + request4 + '&signature=' + signature4)
                            .then(response => {
                                this.setState({
                                    departures: [...this.state.departures, response.data.departures]
                                });
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }, 30000)


        // // Request to retrieve the departures for a specific stop
        // const request2 = '/v3/departures/route_type/0/stop/1108?look_backwards=false&max_results=2&devid=3001097';
        // const signature2 = crypto.createHmac('sha1', key).update(request2).digest('hex');
        // axios.get(baseURL + request2 + '&signature=' + signature2)
        //     .then(response => {
        //         let toCity = [];
        //         let toCragieburn = [];
        //         for (let i in response.data.departures) {
        //             // To city
        //             if (response.data.departures[i].direction_id === 1) {
        //                 toCity.push(response.data.departures[i]);
        //             } else {
        //                 toCragieburn.push(response.data.departures[i]);
        //             }
        //         }
        //         this.setState({
        //             departures: {
        //                 toCity: toCity,
        //                 toCragieburn: toCragieburn
        //             }
        //         });
        //         console.log(this.state.departures);
        //     });

        // setInterval(() => {
        //     axios.get(baseURL + request2 + '&signature=' + signature2)
        //         .then(response => {
        //             let toCity = [];
        //             let toCragieburn = [];
        //             for (let i in response.data.departures) {
        //                 // To city
        //                 if (response.data.departures[i].direction_id === 1) {
        //                     toCity.push(response.data.departures[i]);
        //                 } else {
        //                     toCragieburn.push(response.data.departures[i]);
        //                 }
        //             }
        //             this.setState({
        //                 departures: {
        //                     toCity: toCity,
        //                     toCragieburn: toCragieburn
        //                 }
        //             });
        //             console.log(this.state.departures);
        //         });
        // }, 30000);



    }


    render() {
        const position = [this.state.lat, this.state.lng];
        console.log(this.state.stops.sort(this.compareStops));

        return (
            <LeafletMap ref={this.mapRef} center={position} zoom={this.state.zoom}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    url='https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2lhdzk2IiwiYSI6ImNqdHRra3FuNDFjeW00MHBjMnNveGdha2QifQ.HK8K4aseYwzjdqAStXAyxg'
                />
                {/* <TileLayer
                    attribution='<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap'
                    url='http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'
                /> */}

                {/* Dynamically assign the Markers to the train stops */}
                {
                    this.state.stops.map((key, index) => {
                        const latitude = this.state.stops[index].stop_latitude;
                        const longitude = this.state.stops[index].stop_longitude;
                        let toCity = "";
                        let toCragieburn = "";
                        let AtPlatform = false;
                        for (let i in this.state.departures) {
                            if (this.state.departures[i][0].stop_id === this.state.stops[index].stop_id) {
                                for (let j in this.state.departures[i]) {
                                    let estimatedTime;
                                    estimatedTime = moment.utc(this.state.departures[i][j].estimated_departure_utc);
                                    const now = moment.utc();
                                    const difference = estimatedTime.diff(now, 'minutes');
                                    if (this.state.departures[i][j].direction_id === 1) {
                                        toCity = difference;
                                    } else {
                                        toCragieburn = difference;
                                    }
                                    if (this.state.departures[i][j].at_platform) {
                                        AtPlatform = true;
                                    }
                                }
                            }
                        }
                        if (AtPlatform) {
                            return <Marker icon={trainIcon} position={[latitude, longitude]}>
                                <Popup>
                                    <h1>{this.state.stops[index].stop_name}</h1>
                                    <h2>To City: {toCity}</h2>
                                    <h2>To Cragieburn: {toCragieburn}</h2>
                                    <h2>At Platform: {AtPlatform}</h2>
                                </Popup>
                                <Tooltip>
                                    {this.state.stops[index].stop_name}
                                </Tooltip>
                            </Marker>
                        } else {
                            return <Marker icon={railIcon} position={[latitude, longitude]}>
                                <Popup>
                                    <h1>{this.state.stops[index].stop_name}</h1>
                                    <h2>To City: {toCity}</h2>
                                    <h2>To Cragieburn: {toCragieburn}</h2>
                                </Popup>
                                <Tooltip>
                                    {this.state.stops[index].stop_name}
                                </Tooltip>
                            </Marker>
                        }
                    })
                }

                {
                    (this.state.latlngs.length !== 0) ? <Polyline positions={this.state.latlngs.sort(this.compareStops)} /> : null
                }

                {/* <Marker position={[-37.79377775, 144.930527]}>
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
                </Marker> */}
            </LeafletMap>
        );
    }
}