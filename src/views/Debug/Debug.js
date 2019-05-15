import React from 'react';
import { Button, Card, CardBody, Input, InputGroup, InputGroupAddon } from 'reactstrap';

import './Debug.css';

const axios = require('axios');
const moment = require('moment');

export default class Debug extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departures: [],
            stops: [],
            runID: '',
            stopID: '',
            routeID: '',
            result1: '',
            result2: '',
            result3: '',
        };
    }

    sortDeparturesBasedOnTime(a, b) {
        const aTime = moment.utc(a.estimated_departure_utc);
        const bTime = moment.utc(b.estimated_departure_utc);

        let comparison = 0;
        if (aTime.isAfter(bTime)) {
            comparison = 1;
        } else if (aTime.isBefore(bTime)) {
            comparison = -1;
        }

        return comparison;
    }

    handleChangeRunID(event) {
        this.setState({
            runID: event.target.value
        });
    }

    handleChangeStopID(event) {
        this.setState({
            stopID: event.target.value
        });
    }

    handleChangeRouteID(event) {
        this.setState({
            routeID: event.target.value
        });
    }

    returnDepartures(runID) {
        let departures = [];
        for (let i in this.state.departures) {
            for (let j in this.state.departures[i]) {
                for (let k in this.state.departures[i][j]) {
                    if (this.state.departures[i][j][k].run_id === runID) {
                        departures.push(this.state.departures[i][j][k]);
                    }
                }
            }
        }
        departures.sort(this.sortDeparturesBasedOnTime);
        console.log(departures);

        let filteredDepartures = [];
        const currentTime = moment.utc();

        for (let i in departures) {
            const departureTime = moment.utc(departures[i].estimated_departure_utc);
            const differenceInTime = Math.abs(departureTime.diff(currentTime, 'minutes'));
            const stopName = this.returnStopName(departures[i].stop_id);
            filteredDepartures.push(stopName, differenceInTime);
        }

        const result = [];
        result.push(departures);
        result.push(filteredDepartures);

        this.setState({
            result1: result
        });


    }

    returnStopInformation(stopID) {
        for (let i in this.state.stops) {
            for (let j in this.state.stops[i]) {
                if (this.state.stops[i][j].stop_id === stopID) {
                    this.setState({
                        result2: this.state.stops[i][j]
                    });
                }
            }
        }
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

    returnStops(routeID) {
        for (let i in this.state.stops) {
            if (this.state.stops[i][0].route_id === routeID) {
                this.setState({
                    result3: this.state.stops[i]
                });
            }
        }
    }

    componentDidMount() {
        axios.get("/api/stops")
            .then(response => {
                this.setState({
                    stops: response.data
                });
            })

        axios.get("/api/departures")
            .then(response => {
                this.setState({
                    departures: response.data
                });
            })

        setInterval(() => {
            axios.get("/api/stops")
                .then(response => {
                    this.setState({
                        stops: response.data
                    });
                })

            axios.get("/api/departures")
                .then(response => {
                    this.setState({
                        departures: response.data
                    });
                })
        }, 15000)
    }

    render() {
        const stops = this.state.stops;
        const departures = this.state.departures;

        // console.log(this.state.stops);

        return (
            <div className="col text-center">
                <InputGroup className="center">
                    <Input placeholder="Return departures for the run id" value={this.state.runID} onChange={evt => this.handleChangeRunID(evt)} />
                    <Button onClick={() => this.returnDepartures(parseInt(this.state.runID))} color="info" className="btn btn-default">Submit</Button>
                </InputGroup>
                <Card className="center">
                    <CardBody>
                        <div><pre>{JSON.stringify(this.state.result1, null, 1)}</pre></div>
                    </CardBody>
                </Card>
                <InputGroup className="center">
                    <Input placeholder="Return stop information with the stop ID" value={this.state.stopID} onChange={evt => this.handleChangeStopID(evt)} />
                    <Button onClick={() => this.returnStopInformation(parseInt(this.state.stopID))} color="info" className="btn btn-default">Submit</Button>
                </InputGroup>
                <Card className="center">
                    <CardBody>
                        <div><pre>{JSON.stringify(this.state.result2, null, 1)}</pre></div>
                    </CardBody>
                </Card>
                <InputGroup className="center">
                    <Input placeholder="Return stops for the route id" value={this.state.routeID} onChange={evt => this.handleChangeRouteID(evt)} />
                    <Button onClick={() => this.returnStops(parseInt(this.state.routeID))} color="info" className="btn btn-default">Submit</Button>
                </InputGroup>
                <Card className="center">
                    <CardBody>
                        <div><pre>{JSON.stringify(this.state.result3, null, 1)}</pre></div>
                    </CardBody>
                </Card>
            </div>
        )
    }
}