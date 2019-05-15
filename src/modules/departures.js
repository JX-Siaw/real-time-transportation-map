const moment = require('moment');

function compareDeparturesTime(a, b) {
    let aTime, bTime;
    if (a.estimated_departure_utc) {
        aTime = moment.utc(a.estimated_departure_utc);
    }
    else {
        aTime = moment.utc(a.scheduled_departure_utc);
    }

    if (b.estimated_departure_utc) {
        bTime = moment.utc(b.estimated_departure_utc);
    }
    else {
        bTime = moment.utc(b.scheduled_departure_utc);
    }

    let comparison = 0;
    if (aTime.isAfter(bTime)) {
        comparison = 1;
    } else if (aTime.isBefore(bTime)) {
        comparison = -1;
    }

    return comparison;
}

export function getUniqueRuns(departures, route_id) {
    let runs = [];

    for (let i in departures) {
        for (let j in departures[i]) {
            if (runs.indexOf(departures[i][j].run_id) === -1 && departures[i][j].route_id === route_id) {
                runs.push(departures[i][j].run_id);
            }
        }
    }

    return runs;

};

export function getDeparturesForRuns(runs, departures) {
    let filteredRuns = [];
    let run_id;

    for (let a in runs) {
        run_id = runs[a];
        let filteredDepartures = [];
        let direction_id;

        for (let i in departures) {
            for (let j in departures[i]) {
                if (departures[i][j].run_id === run_id) {
                    filteredDepartures.push(departures[i][j]);

                    if (!direction_id) {
                        direction_id = departures[i][j].direction_id;
                    }
                }
            }
        }

        if (filteredDepartures.length > 0) {
            filteredDepartures.sort(compareDeparturesTime);

            filteredRuns.push({
                run_id: run_id,
                direction_id: direction_id,
                departures: filteredDepartures
            });

        }

    }

    return filteredRuns;

}

export function determineRunCoordinates(scalar, previousStopCoordinates, nextStopCoordinates) {
    const xCoordinate = (scalar * previousStopCoordinates[0]) + ((1 - scalar) * nextStopCoordinates[0]);
    const yCoordinate = (scalar * previousStopCoordinates[1]) + ((1 - scalar) * nextStopCoordinates[1]);

    return [xCoordinate, yCoordinate];
}

export function calculateAngle(previousStopCoordinates, nextStopCoordinates) {

    let angle;

    if (previousStopCoordinates) {
        const latitude = nextStopCoordinates[0] - previousStopCoordinates[0];
        const longitude = nextStopCoordinates[1] - previousStopCoordinates[1];
        angle = Math.atan(longitude / latitude) * 180 / Math.PI;
    } else {
        angle = 0;
    }


    return angle;
}