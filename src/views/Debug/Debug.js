import React from 'react';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';

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

        console.log(filteredDepartures);


    }

    returnStopInformation(stopID) {
        for (let i in this.state.stops) {
            for (let j in this.state.stops[i]) {
                if (this.state.stops[i][j].stop_id === stopID) {
                    console.log(this.state.stops[i][j]);
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
                <InputGroup className="center">
                    <Input placeholder="Return stop information with the stop ID" value={this.state.stopID} onChange={evt => this.handleChangeStopID(evt)} />
                    <InputGroupAddon>
                        <Button onClick={() => this.returnStopInformation(parseInt(this.state.stopID))} color="info" className="btn btn-default">Submit</Button>
                    </InputGroupAddon>
                </InputGroup>
                <InputGroup className="center">
                    <Input placeholder="Return stops for the route id" />
                    <InputGroupAddon>
                        <Button color="info" className="btn btn-default">Submit</Button>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        )
    }
}