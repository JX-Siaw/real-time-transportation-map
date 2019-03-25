import React from 'react';
import { PacmanLoader } from 'react-spinners';

const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        var now = moment.utc().format();
        var key = 'b4ba8648-d112-4cf5-891d-8533756cef97';
        var id = '3001097';
        
        // Health check
        var request = '/v2/healthcheck?timestamp=' + now + '&devid=' + id;
        var baseURL = 'https://timetableapi.ptv.vic.gov.au';
        console.log(now);
        var signature = crypto.createHmac('sha1', key).update(request).digest('hex');
        console.log(signature);
        axios.get(baseURL + request + '&signature=' + signature)
            .then(function (response) {
                console.log(response);
            });


        // Request for disruptions
        var request2 = '/v3/disruptions?disruption_status=current&devid=' + id;
        var signature2 = crypto.createHmac('sha1', key).update(request2).digest('hex');

        axios.get(baseURL + request2 + '&signature=' + signature2)
            .then(function (response) {
                console.log(response);
            });

        // Request for routes
        var request3 = '/v3/routes?devid=' + id;
        var signature3 = crypto.createHmac('sha1', key).update(request3).digest('hex');

        axios.get(baseURL + request3 + '&signature=' + signature3)
            .then(function (response) {
                console.log(response);
            });

        
    }

    calculateSignature(id, key) {

    }

    render() {
        return (
            <div>
                <PacmanLoader
                    sizeUnit={"px"}
                    css={`
                    margin: 60px;
                    display: block;
                    left: 40%;
                    `}
                    size={40}
                    color={'#336573'}
                />
                <h1>Welcome to Xephiz.Dev</h1>
                <h2>This site is still under construction</h2>

            </div>
        )
    }
}