import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
// import worldGeoJSON from 'geojson-world-map';

import './Map.css';

// Importing Submodules
import * as API from '../../modules/PTVapi';
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
            runsAtStation: [],
            runsBetweenStations: [],
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
        API.healthCheck();

        axios.get('/train')
            .then(response => {
                console.log(response.data);
                const { runsAtStation, runsBetweenStations } = response.data;
                this.setState({
                    runsAtStation: runsAtStation,
                    runsBetweenStations: runsBetweenStations
                });
            })

        axios.get('/stops')
            .then(response => {
                this.setState({
                    stops: response.data
                });
                console.log(response.data);
            })

        setInterval(() => {
            axios.get('/train')
                .then(response => {
                    console.log(response.data);
                    const { runsAtStation, runsBetweenStations } = response.data;
                    this.setState({
                        runsAtStation: runsAtStation,
                        runsBetweenStations: runsBetweenStations
                    });
                })
        }, 15000);

        // let departures = [];
        // let stops = [];
        // for (let i in this.state.routes) {
        //     const route_id = this.state.routes[i];
        //     API.getStops(route_id)
        //         .then(result => {
        //             const routeStops = result;
        //             for (let j in routeStops) {
        //                 routeStops[j].route_id = route_id;
        //             }
        //             stops.push(routeStops);
        //             this.setState(prevState => ({
        //                 stops: [...prevState.stops, routeStops]
        //             }));
        //             let result2 = API.getDeparturesForRoute(route_id, result)
        //                 .then(response => {
        //                     departures.push(response);
        //                     this.setState(prevState => ({
        //                         departures: [...prevState.departures, response]
        //                     }));
        //                     if (departures.length === this.state.routes.length) {

        //                         console.log(departures);
        //                         console.log(stops);

        //                         let runs;
        //                         let filteredRuns;
        //                         let runsAtStation = [];
        //                         let runsBetweenStations = [];
        //                         departures = departures.sort(this.sortDepartures);
        //                         stops = stops.sort(this.sortStops);

        //                         console.log(departures);
        //                         console.log(stops);
        //                         // console.log(departures);
        //                         // console.log(stations);
        //                         for (let i in departures) {
        //                             runs = Departures.getUniqueRuns(departures[i], this.state.routes[i]);
        //                             filteredRuns = Departures.getDeparturesForRuns(runs, departures[i]);
        //                             console.log(filteredRuns);
        //                             for (let j in filteredRuns) {
        //                                 if (filteredRuns[j].departures[0].at_platform) {
        //                                     runsAtStation.push({
        //                                         departure: filteredRuns[j].departures[0],
        //                                         coordinates: Stations.getStopCoordinate(stops[i], filteredRuns[j].departures[0].stop_id)
        //                                     });
        //                                 } else {
        //                                     runsBetweenStations.push({
        //                                         departure: filteredRuns[j].departures[0],
        //                                         coordinates: Stations.getCoordinatesPair(stops[i], filteredRuns[j].departures[0].stop_id, filteredRuns[j].direction_id)
        //                                     });
        //                                 }
        //                             }
        //                         }
        //                         this.setState({
        //                             runsAtStation: runsAtStation,
        //                             runsBetweenStations: runsBetweenStations
        //                         });
        //                     }

        //                 })
        //         })
        // }


        // setInterval(() => {
        //     API.healthCheck();

        //     this.setState({
        //         departures: []
        //     }, () => {
        //         let departures = [];
        //         for (let i in this.state.routes) {
        //             const route_id = this.state.routes[i];
        //             let result2 = API.getDeparturesForRoute(route_id, this.state.stops[i])
        //                 .then(response => {
        //                     departures.push(response);
        //                     this.setState(prevState => ({
        //                         departures: [...prevState.departures, response]
        //                     }));

        //                     if (departures.length === this.state.routes.length) {
        //                         let runs;
        //                         let filteredRuns;
        //                         let runsAtStation = [];
        //                         let runsBetweenStations = [];
        //                         departures = departures.sort(this.sortDepartures);
        //                         const stations = this.state.stops.sort(this.sortStops);
        //                         for (let i in departures) {
        //                             runs = Departures.getUniqueRuns(departures[i], this.state.routes[i]);
        //                             filteredRuns = Departures.getDeparturesForRuns(runs, departures[i]);
        //                             console.log(filteredRuns);
        //                             for (let j in filteredRuns) {
        //                                 if (filteredRuns[j].departures[0].at_platform) {
        //                                     runsAtStation.push({
        //                                         departure: filteredRuns[j].departures[0],
        //                                         coordinates: Stations.getStopCoordinate(stations[i], filteredRuns[j].departures[0].stop_id)
        //                                     });
        //                                 } else {
        //                                     runsBetweenStations.push({
        //                                         departure: filteredRuns[j].departures[0],
        //                                         coordinates: Stations.getCoordinatesPair(stations[i], filteredRuns[j].departures[0].stop_id, filteredRuns[j].direction_id)
        //                                     });
        //                                 }
        //                             }
        //                         }
        //                         this.setState({
        //                             runsAtStation: runsAtStation,
        //                             runsBetweenStations: runsBetweenStations
        //                         });
        //                     }
        //                 })
        //         }
        //     });
        // }, 30000);
    }

    render() {
        const position = [this.state.lat, this.state.lng];
        const stations = this.state.stops;
        // const departures = this.state.departures.sort(this.sortDepartures);

        let runsAtStation = this.state.runsAtStation;
        let runsBetweenStations = this.state.runsBetweenStations;
        // let runs;
        // let filteredRuns;

        // if (stations.length > 0)
        //     console.log(stations);
        // if (departures.length > 0) {
        //     departures.sort(this.sortDepartures);
        //     console.log(departures);
        //     if (departures.length === this.state.routes.length) {
        //         for (let i in departures) {
        //             runs = Departures.getUniqueRuns(departures[i], this.state.routes[i]);
        //             filteredRuns = Departures.getDeparturesForRuns(runs, departures[i]);
        //             console.log(filteredRuns);
        //             for (let j in filteredRuns) {
        //                 if (filteredRuns[j].departures[0].at_platform) {
        //                     runsAtStation.push({
        //                         departure: filteredRuns[j].departures[0],
        //                         coordinates: Stations.getStopCoordinate(stations[i], filteredRuns[j].departures[0].stop_id)
        //                     });
        //                 } else {
        //                     runsBetweenStations.push({
        //                         departure: filteredRuns[j].departures[0],
        //                         coordinates: Stations.getCoordinatesPair(stations[i], filteredRuns[j].departures[0].stop_id, filteredRuns[j].direction_id)
        //                     });
        //                 }
        //             }
        //         }
        //     }
        // }



        console.log(runsAtStation);
        console.log(runsBetweenStations);



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

                {
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
                }

                <MarkerClusterGroup maxClusterRadius={10}>
                    {
                        runsBetweenStations.map((key, index) => {
                            let timeStamp
                            if (runsBetweenStations[index].departure.estimated_departure_utc) {
                                const estimatedTime = moment.utc(runsBetweenStations[index].departure.estimated_departure_utc);
                                timeStamp = estimatedTime.diff(moment.utc(), 'minutes');
                            } else {
                                const scheduledTime = moment.utc(runsBetweenStations[index].departure.scheduled_departure_utc);
                                timeStamp = scheduledTime.diff(moment.utc(), 'minutes');
                            }
                            if (!runsBetweenStations[index].coordinates.previousStopCoordinates) {
                                const coordinates = runsBetweenStations[index].coordinates.nextStopCoordinates;
                                return <Marker icon={trainIcon} position={coordinates}>
                                    <Tooltip>
                                        <p>Run ID: {runsBetweenStations[index].departure.run_id}</p>
                                        <p>Departing Time: {timeStamp}</p>
                                    </Tooltip>
                                </Marker>
                            } else {
                                if (runsBetweenStations[index].departure.estimated_departure_utc) {
                                    const coordinates = Departures.determineRunCoordinates(0.5, runsBetweenStations[index].coordinates.previousStopCoordinates, runsBetweenStations[index].coordinates.nextStopCoordinates);
                                    if (runsBetweenStations[index].departure.direction_id === 1) {
                                        return <RotatedMarker icon={trainSideIcon} position={coordinates} rotationAngle={90} rotationOrigin={'center'}>
                                            <Tooltip>
                                                <p>Run ID: {runsBetweenStations[index].departure.run_id}</p>
                                                <p>Arrival Time: {timeStamp}</p>
                                            </Tooltip>
                                        </RotatedMarker>
                                    } else {
                                        return <RotatedMarker icon={trainSideIcon} position={coordinates} rotationAngle={-90} rotationOrigin={'center'}>
                                            <Tooltip>
                                                <p>Run ID: {runsBetweenStations[index].departure.run_id}</p>
                                                <p>Arrival Time: {timeStamp}</p>
                                            </Tooltip>
                                        </RotatedMarker>
                                    }
                                }
                            }
                        })
                    }
                </MarkerClusterGroup>

                {stations[0] ?
                    stations[0].map((key, index) => {
                        const coordinates = [stations[0][index].stop_latitude, stations[0][index].stop_longitude];
                        return <Marker icon={railIcon} position={coordinates}>
                            <Tooltip>
                                {stations[0][index].stop_name}
                            </Tooltip>
                        </Marker>
                    })
                    : null
                }

                {stations[1] ?
                    stations[1].map((key, index) => {
                        const coordinates = [stations[1][index].stop_latitude, stations[1][index].stop_longitude];
                        return <Marker icon={railIcon} position={coordinates}>
                            <Tooltip>
                                {stations[1][index].stop_name}
                            </Tooltip>
                        </Marker>
                    })
                    : null
                }

                {stations[2] ?
                    stations[2].map((key, index) => {
                        const coordinates = [stations[2][index].stop_latitude, stations[2][index].stop_longitude];
                        return <Marker icon={railIcon} position={coordinates}>
                            <Tooltip>
                                {stations[2][index].stop_name}
                            </Tooltip>
                        </Marker>
                    })
                    : null
                }

{stations[3] ?
                    stations[3].map((key, index) => {
                        const coordinates = [stations[3][index].stop_latitude, stations[3][index].stop_longitude];
                        return <Marker icon={railIcon} position={coordinates}>
                            <Tooltip>
                                {stations[3][index].stop_name}
                            </Tooltip>
                        </Marker>
                    })
                    : null
                }

                {/* {
                    stations.map((key, index) => {
                        if (index < stations.length - 1 && stations[index].stop_sequence < 19) {
                            let nextIndex = index + 1;
                            const positions = [[stations[index].stop_latitude, stations[index].stop_longitude], [stations[nextIndex].stop_latitude, stations[nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                        if (index < stations.length - 1 && stations[index].stop_sequence === 19) {
                            let nextIndex = 20;
                            const positions = [[stations[index].stop_latitude, stations[index].stop_longitude], [stations[nextIndex].stop_latitude, stations[nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                    })
                }

                {
                    stations.map((key, index) => {
                        if (index < stations.length - 1 && stations[index].stop_sequence === 16) {
                            let nextIndex = 19;
                            const positions = [[stations[index].stop_latitude, stations[index].stop_longitude], [stations[nextIndex].stop_latitude, stations[nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                        if (index < stations.length - 1 && stations[index].stop_sequence === 20) {
                            let nextIndex = index + 1;
                            const positions = [[stations[index].stop_latitude, stations[index].stop_longitude], [stations[nextIndex].stop_latitude, stations[nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                    })
                } */}

                {stations[0] ?
                    stations[0].map((key, index) => {
                        if (index < stations[0].length - 1) {
                            let nextIndex = index + 1;
                            const positions = [[stations[0][index].stop_latitude, stations[0][index].stop_longitude], [stations[0][nextIndex].stop_latitude, stations[0][nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                    })
                    : null
                }

                {stations[1] ?
                    stations[1].map((key, index) => {
                        if (index < stations[1].length - 1) {
                            let nextIndex = index + 1;
                            const positions = [[stations[1][index].stop_latitude, stations[1][index].stop_longitude], [stations[1][nextIndex].stop_latitude, stations[1][nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                    })
                    : null
                }

                {stations[2] ?
                    stations[2].map((key, index) => {
                        if (index < stations[2].length - 1) {
                            let nextIndex = index + 1;
                            const positions = [[stations[2][index].stop_latitude, stations[2][index].stop_longitude], [stations[2][nextIndex].stop_latitude, stations[2][nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                    })
                    : null
                }

                
{stations[3] ?
                    stations[3].map((key, index) => {
                        if (index < stations[3].length - 1) {
                            let nextIndex = index + 1;
                            const positions = [[stations[3][index].stop_latitude, stations[3][index].stop_longitude], [stations[3][nextIndex].stop_latitude, stations[3][nextIndex].stop_longitude]];
                            return <Polyline positions={positions} />
                        }
                    })
                    : null
                }

                

            </LeafletMap >
        );
    }
}
