import React, { Component } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
// import worldGeoJSON from 'geojson-world-map';

import './Map.css';

// Importing Submodules
import * as API from '../../modules/PTVapi';
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

    // async getStops(baseURL, key, devid, route_id) {
    //     const request = '/v3/stops/route/' + route_id + '/route_type/0?direction_id=1&devid=' + devid;
    //     const signature = this.encryptSignature(key, request);

    //     const stops = await axios.get(baseURL + request + '&signature=' + signature)
    //         .then(response => {
    //             const stops = response.data.stops.sort(this.compareStops);
    //             return stops;
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         })

    //     this.setState({
    //         stops: stops
    //     });
    //     return stops
    // }

    async getDepartures(baseURL, key, devid, route_id, stop_id) {
        const request = '/v3/departures/route_type/0/stop/' + stop_id + '/route/' + route_id + '?look_backwards=false&max_results=1&devid=' + devid;
        const signature = this.encryptSignature(key, request);

        const departures = await axios.get(baseURL + request + '&signature=' + signature)
            .then(response => {
                return response.data.departures
            })
            .catch(error => {
                console.log(error);
            })
        return departures;
    }

    async updateDepartures(baseURL, key, devid) {
        this.setState({
            departures: []
        });

        let departures = [];
        for (let i in this.state.stops) {
            const stop_id = this.state.stops[i].stop_id;
            const route_id = 3;

            departures.push(await this.getDepartures(baseURL, key, devid, route_id, stop_id)
                .then(response => {
                    // this.setState({
                    //     departures: [...this.state.departures, response]
                    // });
                    return response;
                })
            )
        }
        return departures;
    }

    calculateTrain() {
        const stops = this.state.stops;
        const departures = this.state.departures;

        for (let i in stops) {
            for (let j in departures) {
                for (let k in departures[j]) {
                    if (departures[j][k].stop_id === stops[i].stop_id) {
                        const estimatedTime = moment.utc(departures[j][k].estimated_departure_utc);
                        const difference = estimatedTime.diff(moment.utc(), 'minutes');
                        if (difference <= 2 && !departures[j][k].at_platform && departures[j][k].direction_id === 1) {
                            console.log("There is a train before: " + stops[i].stop_name + "," + stops[i].stop_sequence);
                        }
                    }

                }

            }
        }

        // console.log(stops);
        // console.log(departures);
    }

    getStopName(stopID) {
        for (let i in this.state.stops) {
            if (this.state.stops[i].stop_id === stopID) {
                return this.state.stops[i].stop_name;
            }
        }
    }

    getTrainInBetween() {
        const stops = this.state.stops;
        const departures = this.state.departures;
        const runs = [];

        // console.log(departures);

        for (let i in departures) {
            for (let j in departures[i]) {
                if (runs.indexOf(departures[i][j].run_id) === -1 && departures[i][j].route_id === 3) {
                    runs.push(departures[i][j].run_id);
                }
            }
        }

        console.log(runs);
        let trainIsBetweenStation = [];
        let trainAtStation = [];
        let checkedRuns = [];

        for (let i in runs) {
            let estimatedTime;
            let departurewithShortestEstimatedTime;
            let lastStop;
            console.log(i);
            for (let j in departures) {
                for (let k in departures[j]) {

                    // if (departures[j][k].run_id === 953813) {
                    //     console.log(departures[j][k]);
                    //     console.log(this.getStopName(departures[j][k].stop_id));
                    // }

                    if (departures[j][k].run_id === runs[i]) {
                        // if (runs[i] === 953216) {
                        //     console.log(departures[j][k]);
                        // }   
                        if (departures[j][k].at_platform) {
                            trainAtStation.push({
                                stopID: departures[j][k].stop_id,
                                runID: runs[i]
                            });
                            checkedRuns.push(runs[i]);
                        } else {
                            if (!estimatedTime) {
                                estimatedTime = moment.utc(departures[j][k].estimated_departure_utc);
                                departurewithShortestEstimatedTime = departures[j][k];
                            } else {
                                if (estimatedTime.isAfter(moment.utc(departures[j][k].estimated_departure_utc))) {
                                    estimatedTime = moment.utc(departures[j][k].estimated_departure_utc);
                                    departurewithShortestEstimatedTime = departures[j][k];
                                }
                            }
                        }
                    }
                }
            }

            if (departurewithShortestEstimatedTime) {
                console.log(checkedRuns);
                let timeStamp = estimatedTime.diff(moment.utc(), 'minutes');
                if (estimatedTime.diff(moment.utc(), 'minutes') < 5) {
                    if (!checkedRuns.includes(runs[i])) {
                        for (let l in stops) {
                            if (departurewithShortestEstimatedTime.stop_id === stops[l].stop_id) {
                                if (departurewithShortestEstimatedTime.direction_id === 1 && stops[l].stop_sequence === 1) {
                                    // console.log("There is a train departing from Cragieburn heading to City");
                                }
                                else if (departurewithShortestEstimatedTime.direction_id === 2 && stops[l].stop_sequence === 21) {
                                    // console.log("There is a train departing from Flinders Street Station to Cragieburn");
                                }
                                else if (departurewithShortestEstimatedTime.direction_id === 1 && stops[l].stop_sequence > 1) {
                                    let index = l - 1;
                                    lastStop = stops[index];
                                    const trainsPair = {
                                        lastStationID: lastStop.stop_id,
                                        lastStationName: lastStop.stop_name,
                                        nextStationID: stops[l].stop_id,
                                        nextStationName: stops[l].stop_name,
                                        arrivalTime: timeStamp,
                                        runID: runs[i]
                                    }
                                    trainIsBetweenStation.push(trainsPair);
                                    checkedRuns.push(runs[i]);
                                    // console.log("There is a train between " + lastStop.stop_name + "(" + lastStop.stop_id + ")" + " and " + stops[l].stop_name + " heading to the city.");
                                } else {
                                    if (stops[l].stop_sequence < 21) {
                                        let index = parseInt(l) + 1;
                                        lastStop = stops[index];
                                        const trainsPair = {
                                            lastStationID: lastStop.stop_id,
                                            lastStationName: lastStop.stop_name,
                                            nextStationID: stops[l].stop_id,
                                            nextStationName: stops[l].stop_name,
                                            arrivalTime: timeStamp,
                                            runID: runs[i]
                                        }
                                        trainIsBetweenStation.push(trainsPair);
                                        checkedRuns.push(runs[i]);
                                        // console.log("There is a train between " + lastStop.stop_name + "(" + lastStop.stop_id + ")" + " and " + stops[l].stop_name + " heading to the Cragieburn with the runID " + runs[i]);
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }
        return [trainAtStation, trainIsBetweenStation];
    }

    getTrainLocation(trainAtStation, trainIsBetweenStation) {
        let trainCoordinates = [];

        for (let j in trainAtStation) {
            const result = this.getTrainCoordinates(trainAtStation[j].stopID);
            const trainCoordinate = {
                type: "At Station",
                coordinates: result.stopCoordinates,
                name: result.stopName,
                runID: trainAtStation[j].runID
            };
            trainCoordinates.push(trainCoordinate);
        }

        for (let i in trainIsBetweenStation) {
            const result = this.getInBetweenTrainCoordinates(trainIsBetweenStation[i].lastStationID, trainIsBetweenStation[i].nextStationID);
            const arrivalTime = trainIsBetweenStation[i].arrivalTime;
            let latitude;
            let longitude;
            console.log(arrivalTime);
            if (arrivalTime < 1) {
                latitude = (0.25 * result.lastStopCoords.latitude + 0.75 * result.nextStopCoords.latitude);
                longitude = (0.25 * result.lastStopCoords.longitude + 0.75 * result.nextStopCoords.longitude);
            } else if (arrivalTime < 2) {
                latitude = (0.5 * result.lastStopCoords.latitude + 0.5 * result.nextStopCoords.latitude);
                longitude = (0.5 * result.lastStopCoords.longitude + 0.5 * result.nextStopCoords.longitude);
            } else {
                latitude = (0.75 * result.lastStopCoords.latitude + 0.25 * result.nextStopCoords.latitude);
                longitude = (0.75 * result.lastStopCoords.longitude + 0.25 * result.nextStopCoords.longitude);
            }

            const coordinates = {
                latitude: latitude,
                longitude: longitude
            };

            const trainCoordinate = {
                type: "Between Station",
                coordinates: coordinates,
                direction_id: result.direction_id,
                arrivalTime: arrivalTime,
                runID: trainIsBetweenStation[i].runID
            };
            trainCoordinates.push(trainCoordinate);
        }
        return trainCoordinates;
    }

    getTrainCoordinates(stopID) {
        let stopCoordinates;
        let stopName;
        for (let i in this.state.stops) {
            if (this.state.stops[i].stop_id === stopID) {
                stopCoordinates = {
                    latitude: this.state.stops[i].stop_latitude,
                    longitude: this.state.stops[i].stop_longitude
                };
                stopName = this.state.stops[i].stop_name;
            }
        }
        return {
            stopCoordinates: stopCoordinates,
            stopName: stopName
        }
    }

    getInBetweenTrainCoordinates(lastStopID, nextStopID) {
        let lastStopCoords;
        let nextStopCoords;
        let lastStop;
        let nextStop;
        for (let i in this.state.stops) {
            if (this.state.stops[i].stop_id === lastStopID) {
                lastStop = this.state.stops[i];
                lastStopCoords = {
                    latitude: this.state.stops[i].stop_latitude,
                    longitude: this.state.stops[i].stop_longitude
                };
            }

            if (this.state.stops[i].stop_id === nextStopID) {
                nextStop = this.state.stops[i];
                nextStopCoords = {
                    latitude: this.state.stops[i].stop_latitude,
                    longitude: this.state.stops[i].stop_longitude
                };
            }
        }

        let direction_id;
        if (nextStop.stop_sequence > lastStop.stop_sequence) {
            direction_id = 1; // To city
        } else {
            direction_id = 2; // To cragieburn
        }


        let latitude;
        let longitude;

        // if (direction_id === 1) {
        //     latitude = (0.75 * lastStopCoords.latitude + 0.25 * nextStopCoords.latitude);
        //     longitude = (0.75 * lastStopCoords.longitude + 0.25 * nextStopCoords.longitude);
        // } else {
        //     latitude = (0.75 * lastStopCoords.latitude + 0.25 * nextStopCoords.latitude);
        //     longitude = (0.75 * lastStopCoords.longitude + 0.25 * nextStopCoords.longitude);
        // }

        return {
            lastStopCoords: lastStopCoords,
            nextStopCoords: nextStopCoords,
            direction_id: direction_id
        }
    }

    componentDidMount() {
        API.healthCheck();
        API.getStops(3)
            .then(result => {
                this.setState({
                    stops: result
                });
                let result2 = API.getDeparturesForRoute(3, result)
                    .then(response => {
                        this.setState({
                            departures: response
                        })
                    })
                let finalResult = [result, result2]
            })
        // this.setState({
        //     stops: stops
        // });

        // Kensington Stop Id = 1108
        // Broadmeadows Route Id = 3    

        // this.getStops(baseURL, key, id, 3)
        //     .then(result => {
        //         this.updateDepartures(baseURL, key, id)
        //             .then(response => {
        //                 this.setState({
        //                     departures: response
        //                 });

        //                 let rails = [];
        //                 let stations = [];
        //                 for (let h in this.state.stops) {
        //                     const latitude = this.state.stops[h].stop_latitude;
        //                     const longitude = this.state.stops[h].stop_longitude;
        //                     let toCity = "";
        //                     let toCragieburn = "";
        //                     let atPlatform = false;
        //                     let stationName = this.state.stops[h].stop_name;
        //                     for (let j in response[h]) {
        //                         let estimatedTime;
        //                         estimatedTime = moment.utc(response[h][j].estimated_departure_utc);
        //                         const now = moment.utc();
        //                         const difference = estimatedTime.diff(now, 'minutes');
        //                         if (response[h][j].direction_id === 1) {
        //                             toCity = difference;
        //                         } else {
        //                             toCragieburn = difference;
        //                         }
        //                         if (response[h][j].at_platform) {
        //                             atPlatform = true;
        //                         }
        //                     }

        //                     let object;

        //                     object = { Icon: railIcon, positions: [latitude, longitude], stationName: stationName, toCity: toCity, toCragieburn: toCragieburn };
        //                     rails.push(object);
        //                 }

        //                 const [trainAtStation, trainIsBetweenStation] = this.getTrainInBetween();
        //                 const trainLocations = this.getTrainLocation(trainAtStation, trainIsBetweenStation);

        //                 this.setState({
        //                     rails: rails,
        //                     stations: stations,
        //                     trainLocations: trainLocations
        //                 });

        //             });
        //     });

        // setInterval(() => {
        //     console.log("Updating Departures");
        //     this.updateDepartures(baseURL, key, id)
        //         .then(response => {
        //             this.setState({
        //                 departures: response
        //             });

        //             let rails = [];
        //             let stations = [];
        //             for (let h in this.state.stops) {
        //                 const latitude = this.state.stops[h].stop_latitude;
        //                 const longitude = this.state.stops[h].stop_longitude;
        //                 let toCity = "";
        //                 let toCragieburn = "";
        //                 let atPlatform = false;
        //                 let stationName = this.state.stops[h].stop_name;
        //                 for (let j in response[h]) {
        //                     let estimatedTime;
        //                     estimatedTime = moment.utc(response[h][j].estimated_departure_utc);
        //                     const now = moment.utc();
        //                     const difference = estimatedTime.diff(now, 'minutes');
        //                     if (response[h][j].direction_id === 1) {
        //                         toCity = difference;
        //                     } else {
        //                         toCragieburn = difference;
        //                     }
        //                     if (response[h][j].at_platform) {
        //                         atPlatform = true;
        //                     }
        //                 }

        //                 let object;
        //                 object = { Icon: railIcon, positions: [latitude, longitude], stationName: stationName, toCity: toCity, toCragieburn: toCragieburn };
        //                 rails.push(object);
        //                 // if (atPlatform) {
        //                 //     object = { Icon: trainIcon, positions: [latitude, longitude], stationName: stationName, toCity: toCity, toCragieburn: toCragieburn };
        //                 //     stations.push(object);
        //                 // } else {
        //                 //     object = { Icon: railIcon, positions: [latitude, longitude], stationName: stationName, toCity: toCity, toCragieburn: toCragieburn };
        //                 //     rails.push(object);
        //                 // }
        //             }

        //             const [trainAtStation, trainIsBetweenStation] = this.getTrainInBetween();
        //             const trainLocations = this.getTrainLocation(trainAtStation, trainIsBetweenStation);

        //             this.setState({
        //                 rails: rails,
        //                 stations: stations,
        //                 trainLocations: trainLocations
        //             });
        //         });
        // }, 15000);
    }

    render() {
        const position = [this.state.lat, this.state.lng];
        const stations = this.state.stops;
        const departures = this.state.departures;

        if (stations.length > 0)
            console.log(stations);
        if (departures.length > 0) {
            console.log(departures);
            const runs = Departures.getUniqueRuns(departures, 3);
            const filteredRuns = Departures.getDeparturesForRuns(runs, departures);
            console.log(filteredRuns);
        }



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
                    stations.map((key, index) => {
                        const coordinates = [stations[index].stop_latitude, stations[index].stop_longitude];
                        return <Marker icon={railIcon} position={coordinates}>
                            <Tooltip>
                                {stations[index].stop_name}
                            </Tooltip>
                        </Marker>
                    })
                }
                {
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
                }

            </LeafletMap >
        );
    }
}
