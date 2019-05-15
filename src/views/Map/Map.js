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
            routes: [3, 15, 14],    // 2 = Belgrave, 3 = Cragieburn, 14 = Sunbury, 15 = Upfield, 
            stops: [],
            departures: [],
            runs: [],
            latlngs: [],
            rails: [],
            trainLocations: []
        };
    }

    encryptSignature(key, url) {
        return crypto.createHmac('sha1', key).update(url).digest('hex');
    }

    // To sort the array of stops according to the stop_sequence_id
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

    sortStops(a, b) {
        const aRouteID = a[0].route_id;
        const bRouteID = b[0].route_id;

        const aRouteIDIndex = routes.indexOf(aRouteID);
        const bRouteIDIndex = routes.indexOf(bRouteID);

        console.log("A Route ID: " + aRouteID + ", B Route ID: " + bRouteID);
        console.log("B Route ID Index: " + aRouteIDIndex + ", B Route ID Index: " + bRouteIDIndex);

        let comparison = 0;
        if (aRouteIDIndex > bRouteIDIndex) {
            comparison = 1;
        } else if (aRouteIDIndex < bRouteIDIndex) {
            comparison = -1;
        }

        console.log("Comparison = " + comparison);

        return comparison;
    }

    sortDepartures(a, b) {
        const aRouteID = a[0][0].route_id;
        const bRouteID = b[0][0].route_id;

        console.log(aRouteID);

        const aRouteIDIndex = routes.indexOf(aRouteID);
        const bRouteIDIndex = routes.indexOf(bRouteID);

        let comparison = 0;
        if (aRouteIDIndex > bRouteIDIndex) {
            comparison = 1;
        } else if (aRouteIDIndex < bRouteIDIndex) {
            comparison = -1;
        }

        return comparison;
    }

    componentDidMount() {
        axios.get('/api/train')
            .then(response => {
                console.log(response.data);
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
                console.log(response.data);
            })

        setInterval(() => {
            axios.get('/api/train')
                .then(response => {
                    console.log(response.data);
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

        // const rails = this.state.rails;
        // const trainLocations = this.state.trainLocations;
        // console.log(trainLocations);
        return (
            <LeafletMap ref={this.mapRef} center={position} zoom={this.state.zoom} maxZoom={15}>
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

                {/* <MarkerClusterGroup maxClusterRadius={20}>
                    {
                        rails.map((key, index) => {
                            return <Marker icon={rails[index].Icon} position={rails[index].positions}>
                                <Popup className="popup">
                                    <h1>{rails[index].stationName}</h1>
                                    <h2>To City: {rails[index].toCity}</h2>
                                    <h2>To Cragieburn: {rails[index].toCragieburn}</h2>
                                </Popup>
                                <Tooltip>
                                    {rails[index].stationName}
                                </Tooltip>
                            </Marker>
                        })
                    }
                </MarkerClusterGroup>

                <MarkerClusterGroup maxClusterRadius={40}>
                    {
                        trainLocations.map((key, index) => {
                            if (trainLocations[index].type === "Between Station") {
                                const position = [trainLocations[index].coordinates.latitude, trainLocations[index].coordinates.longitude];
                                let tooltip;
                                if (trainLocations[index].direction_id === 1) {
                                    tooltip = "Heading to City";
                                    return <RotatedMarker icon={trainSideIcon} position={position} rotationAngle={90} rotationOrigin={'center'}>
                                        <Tooltip>
                                            {tooltip}
                                        </Tooltip>
                                    </RotatedMarker>
                                } else {
                                    tooltip = "Heading to Cragieburn";
                                    return <RotatedMarker icon={trainSideIcon} position={position} rotationAngle={-90} rotationOrigin={'center'}>
                                        <Tooltip>
                                            {tooltip}
                                        </Tooltip>
                                    </RotatedMarker>
                                }

                            }
                        })
                    }
                </MarkerClusterGroup>

                <MarkerClusterGroup maxClusterRadius={20}>
                    {
                        trainLocations.map((key, index) => {
                            if (trainLocations[index].type === "At Station") {
                                const position = [trainLocations[index].coordinates.latitude, trainLocations[index].coordinates.longitude];
                                let tooltip;
                                if (trainLocations[index].direction_id === 1) {
                                    tooltip = "Heading to City";
                                } else {
                                    tooltip = "Heading to Cragieburn";
                                }
                                return <Marker icon={trainIcon} position={position}>
                                    <Tooltip>
                                        {tooltip}
                                    </Tooltip>
                                </Marker>
                            }
                        })
                    }
                </MarkerClusterGroup> */}

                {/* {
                    runsAtStation.map((key, index) => {
                        const coordinates = runsAtStation[index].coordinates;
                        const estimatedTime = moment.utc(runsAtStation[index].departure.estimated_departure_utc);
                        const timeStamp = estimatedTime.diff(moment.utc(), 'minutes');
                        return <Marker icon={trainIcon} position={coordinates}>
                            <Tooltip>
                                <p>Run ID: {runsAtStation[index].departure.run_id}</p>
                                <p>Arrival Time: {timeStamp}</p>
                            </Tooltip>
                        </Marker>
                    })
                } */}

                <MarkerClusterGroup maxClusterRadius={10}>
                    {
                        runs.map((key, index) => {
                            if (runs[index].departure.estimated_departure_utc) {
                                // Determine timestamp (arrival time)
                                let timeStamp
                                if (runs[index].departure.estimated_departure_utc) {
                                    const estimatedTime = moment.utc(runs[index].departure.estimated_departure_utc);
                                    timeStamp = Math.abs(estimatedTime.diff(moment.utc(), 'minutes'));
                                } else {
                                    const scheduledTime = moment.utc(runs[index].departure.scheduled_departure_utc);
                                    timeStamp = Math.abs(scheduledTime.diff(moment.utc(), 'minutes'));
                                }

                                // Determine angle of the train icon
                                const previousStopCoordinates = runs[index].coordinates.previousStopCoordinates;
                                const nextStopCoordinates = runs[index].coordinates.nextStopCoordinates
                                let coordinates;

                                if (!previousStopCoordinates) {
                                    coordinates = runs[index].coordinates.nextStopCoordinates;
                                    return <Marker icon={trainIcon} position={coordinates}>
                                        <Tooltip>
                                            <p>Run ID: {runs[index].departure.run_id}</p>
                                            <p>Departure Time: {timeStamp}</p>
                                        </Tooltip>
                                    </Marker>
                                }

                                let angle = Departures.calculateAngle(previousStopCoordinates, nextStopCoordinates);
                                if (runs[index].departure.direction_id === 1) {
                                    angle += 90;
                                } else {
                                    angle -= 90;
                                }

                                if (runs[index].departure.at_platform) {
                                    coordinates = runs[index].coordinates.nextStopCoordinates;
                                } else {
                                    coordinates = Departures.determineRunCoordinates(0.5, previousStopCoordinates, nextStopCoordinates);
                                }


                                return <RotatedMarker icon={trainSideIcon} position={coordinates} rotationAngle={angle} rotationOrigin={'center'}>
                                    <Tooltip>
                                        <p>Run ID: {runs[index].departure.run_id}</p>
                                        <p>Arrival Time: {timeStamp}</p>
                                    </Tooltip>
                                </RotatedMarker>






                                // if (!runsBetweenStations[index].coordinates.previousStopCoordinates) {
                                //     const coordinates = runsBetweenStations[index].coordinates.nextStopCoordinates;
                                //     return <Marker icon={trainIcon} position={coordinates}>
                                //         <Tooltip>
                                //             <p>Run ID: {runsBetweenStations[index].departure.run_id}</p>
                                //             <p>Departing Time: {timeStamp}</p>
                                //         </Tooltip>
                                //     </Marker>
                                // } else {
                                //     if (runsBetweenStations[index].departure.estimated_departure_utc) {
                                //         const coordinates = Departures.determineRunCoordinates(0.5, runsBetweenStations[index].coordinates.previousStopCoordinates, runsBetweenStations[index].coordinates.nextStopCoordinates);

                                //         if (runsBetweenStations[index].departure.direction_id === 1) {
                                //             return <RotatedMarker icon={trainSideIcon} position={coordinates} rotationAngle={angle + 90} rotationOrigin={'center'}>
                                //                 <Tooltip>
                                //                     <p>Run ID: {runsBetweenStations[index].departure.run_id}</p>
                                //                     <p>Arrival Time: {timeStamp}</p>
                                //                 </Tooltip>
                                //             </RotatedMarker>
                                //         } else {
                                //             return <RotatedMarker icon={trainSideIcon} position={coordinates} rotationAngle={angle - 90} rotationOrigin={'center'}>
                                //                 <Tooltip>
                                //                     <p>Run ID: {runsBetweenStations[index].departure.run_id}</p>
                                //                     <p>Arrival Time: {timeStamp}</p>
                                //                 </Tooltip>
                                //             </RotatedMarker>
                                //         }
                                //     }
                                // }
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
