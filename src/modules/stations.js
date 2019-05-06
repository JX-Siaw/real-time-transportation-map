// Get coordinates of the stops that the train is currently in between
export function getCoordinatesPair(stops, stop_id, direction_id) {
    let stopsArray;
    let nextStopCoordinates;
    let previousStopCoordinates;

    if (direction_id === 2) {
        stopsArray = stops.slice().reverse();
    } else {
        stopsArray = stops;
    }


    for (let i in stopsArray) {
        if (stopsArray[i].stop_id === stop_id) {
            if (i > 0) {
                previousStopCoordinates = [stopsArray[i - 1].stop_latitude, stopsArray[i - 1].stop_longitude];
                nextStopCoordinates = [stopsArray[i].stop_latitude, stopsArray[i].stop_longitude];
            } else {
                nextStopCoordinates = [stopsArray[i].stop_latitude, stopsArray[i].stop_longitude];
            }
        }
    }

    return {
        previousStopCoordinates: previousStopCoordinates,
        nextStopCoordinates: nextStopCoordinates,
        direction_id: direction_id
    }
}

// Get coordinates of the stop when the train is at platform
export function getStopCoordinate(stops, stop_id) {
    for (let i in stops) {
        if (stops[i].stop_id === stop_id) {
            const stop_latitude = stops[i].stop_latitude;
            const stop_longitude = stops[i].stop_longitude;
            const coordinates = [stop_latitude, stop_longitude];
            return coordinates;
        }
    }
}

