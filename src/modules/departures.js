const moment = require('moment');

function compareDeparturesTime(a, b) {
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

        for (let i in departures) {
            for (let j in departures[i]) {
                if (departures[i][j].run_id === run_id) {
                    filteredDepartures.push(departures[i][j]);
                }
            }
        }

        filteredDepartures.sort(compareDeparturesTime);

        filteredRuns.push({
            run_id: run_id,
            departures: filteredDepartures
        });

    }

    return filteredRuns;

}