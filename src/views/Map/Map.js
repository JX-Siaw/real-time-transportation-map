import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
// import worldGeoJSON from 'geojson-world-map';

import './Map.css';

// Importing Submodules
import * as Stations from '../../modules/stations';
import * as Departures from '../../modules/departures';

// Importing Components
import { railIcon } from '../../components/leaflet-icons/rail-icon/rail-icon';
import { trainIcon } from '../../components/leaflet-icons/train-icon/train-icon';
import { trainSideIcon } from '../../components/leaflet-icons/train-icon/train-side-icon';
import { trainSideInvertedIcon } from '../../components/leaflet-icons/train-icon/train-side-inverted-icon';
import RotatedMarker from '../../components/leaflet-icons/RotatedMarker';

// Importing Packages
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

const routes = [3, 15, 14];

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
            runs: [],
        };
    }

    returnStopName(stopID) {
        for (let i in this.state.stops) {
            for (let j in this.state.stops[i]) {
                if (this.state.stops[i][j].stop_id === stopID) {
                    return this.state.stops[i][j].stop_name;
                }
            }
        }
    }

    componentDidMount() {
        axios.get('/api/train')
            .then(response => {
                const runs = response.data.runs;
                this.setState({
                    runs: runs
                });
            })

        axios.get('/api/stops')
            .then(response => {
                this.setState({
                    stops: response.data
                });
            })

        setInterval(() => {
            axios.get('/api/train')
                .then(response => {
                    const runs = response.data.runs;
                    this.setState({
                        runs: runs
                    });
                })
        }, 15000);
    }

    render() {
        const position = [this.state.lat, this.state.lng];
        const stations = this.state.stops;
        const runs = this.state.runs;

        return (
            <LeafletMap ref={this.mapRef} center={position} zoom={this.state.zoom} maxZoom={17}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    url='https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2lhdzk2IiwiYSI6ImNqdHRra3FuNDFjeW00MHBjMnNveGdha2QifQ.HK8K4aseYwzjdqAStXAyxg'
                />

                <MarkerClusterGroup maxClusterRadius={10}>
                    {
                        runs.map((key, index) => {
                            if (runs[index].departure[0].estimated_departure_utc) {
                                // Determine timestamp (arrival time)
                                let timeStamp;
                                let icon;
                                let angle;
                                let tooltip;
                                if (runs[index].departure[0].estimated_departure_utc) {
                                    const estimatedTime = moment.utc(runs[index].departure[0].estimated_departure_utc);
                                    timeStamp = Math.abs(estimatedTime.diff(moment.utc(), 'minutes'));
                                } else {
                                    const scheduledTime = moment.utc(runs[index].departure[0].scheduled_departure_utc);
                                    timeStamp = Math.abs(scheduledTime.diff(moment.utc(), 'minutes'));
                                }

                                const previousStopCoordinates = runs[index].coordinates.previousStopCoordinates;
                                const nextStopCoordinates = runs[index].coordinates.nextStopCoordinates
                                let coordinates;

                                // For trains that are scheduled to depart from a station
                                if (!previousStopCoordinates) {
                                    coordinates = runs[index].coordinates.nextStopCoordinates;
                                    icon = trainIcon;

                                } else {

                                    icon = trainSideIcon;

                                    // Determine angle of the train icon
                                    angle = Departures.calculateAngle(previousStopCoordinates, nextStopCoordinates);
                                    if (nextStopCoordinates[0] < previousStopCoordinates[0]) {
                                        angle += 90;
                                    } else {
                                        angle += 90;
                                        icon = trainSideInvertedIcon
                                    }
                                }

                                let filteredDepartures = runs[index].departure;
                                let filteredDetails = [];

                                for (let i in filteredDepartures) {
                                    const departureTime = moment.utc(filteredDepartures[i].estimated_departure_utc);
                                    const differenceInTime = Math.abs(departureTime.diff(moment.utc(), 'minutes'));
                                    const stopName = this.returnStopName(filteredDepartures[i].stop_id);
                                    filteredDetails.push({
                                        stopName: stopName,
                                        differenceInTime: differenceInTime
                                    });
                                }

                                // For running trains at platform
                                if (runs[index].departure[0].at_platform) {
                                    coordinates = runs[index].coordinates.nextStopCoordinates;
                                    tooltip = <Tooltip>
                                        <span><strong>At {filteredDetails[0].stopName}</strong></span><br />
                                        <span><strong>Run ID:</strong> {runs[index].departure[0].run_id}</span><br />
                                        <span><strong>Arrival Time:</strong> {timeStamp}</span><br />
                                        <span><strong>Direction ID:</strong> {runs[index].coordinates.direction_id}</span>
                                    </Tooltip>
                                } else {
                                    if (previousStopCoordinates) {
                                        let scalar;
                                        if (timeStamp > 3) {
                                            scalar = 0.9;
                                        }
                                        else if (timeStamp === 3) {
                                            scalar = 0.75;
                                        }
                                        else if (timeStamp === 2) {
                                            scalar = 0.6;
                                        }
                                        else if (timeStamp < 1) {
                                            scalar = 0.3;
                                        } else {
                                            scalar = 0.5;
                                        }
                                        coordinates = Departures.determineRunCoordinates(scalar, previousStopCoordinates, nextStopCoordinates);
                                        tooltip = <Tooltip>
                                            <span><strong>Run ID:</strong> {runs[index].departure[0].run_id}</span><br />
                                            <span><strong>Arrival Time:</strong> {timeStamp}</span><br />
                                            <span><strong>Direction ID:</strong> {runs[index].coordinates.direction_id}</span>
                                        </Tooltip>
                                    }
                                }


                                if (icon === trainIcon) {
                                    return <Marker icon={trainIcon} position={coordinates}>
                                        <Popup>
                                            {
                                                filteredDetails.map((key, index3) => {
                                                    return <span>
                                                        <strong>{filteredDetails[index3].differenceInTime}</strong> minutes -> <strong>{filteredDetails[index3].stopName}</strong>
                                                        <br />
                                                    </span>
                                                })
                                            }
                                        </Popup>
                                        <Tooltip>
                                            <span><strong>Run ID:</strong> {runs[index].departure[0].run_id}</span><br />
                                            <span><strong>Departure Time:</strong> {timeStamp}</span>
                                        </Tooltip>
                                    </Marker>
                                } else {
                                    return <RotatedMarker icon={icon} position={coordinates} rotationAngle={angle} rotationOrigin={'center'}>
                                        <Popup>
                                            {
                                                filteredDetails.map((key, index3) => {
                                                    return <span>
                                                        <strong>{filteredDetails[index3].differenceInTime}</strong> minutes -> <strong>{filteredDetails[index3].stopName}</strong>
                                                        <br />
                                                    </span>
                                                })
                                            }
                                        </Popup>
                                        {tooltip}
                                    </RotatedMarker>
                                }
                            }
                        })
                    }
                </MarkerClusterGroup>

                {
                    stations.map((key, index) => {
                        return stations[index].map((key2, index2) => {
                            const coordinates = [stations[index][index2].stop_latitude, stations[index][index2].stop_longitude];
                            return <Marker icon={railIcon} position={coordinates}>
                                <Tooltip>
                                    {stations[index][index2].stop_name}
                                </Tooltip>
                            </Marker>
                        })
                    })
                }


                {
                    stations.map((key, index) => {
                        return stations[index].map((key2, index2) => {
                            if (index2 < stations[index].length - 1) {
                                let nextIndex = index2 + 1;
                                const positions = [[stations[index][index2].stop_latitude, stations[index][index2].stop_longitude], [stations[index][nextIndex].stop_latitude, stations[index][nextIndex].stop_longitude]];
                                return <Polyline positions={positions} />
                            }
                        })
                    })
                }
            </LeafletMap >
        );
    }
}
