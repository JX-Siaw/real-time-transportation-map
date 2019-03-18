// import React, { Component } from 'react'
// import { Map as LeafletMap, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
// import worldGeoJSON from 'geojson-world-map';

// import './map.css';

// // class Map extends React.Component {
// //     render() {
// //         return (
// //             <LeafletMap
// //                 center={[-37.814, 144.96332]}
// //                 zoom={10}
// //                 maxZoom={15}
// //                 attributionControl={true}
// //                 zoomControl={true}
// //                 doubleClickZoom={true}
// //                 scrollWheelZoom={true}
// //                 dragging={true}
// //                 animate={true}
// //                 easeLinearity={0.35}
// //             >
// //                 <TileLayer
// //                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// //                 />
// //                 <Marker position={[-37.814, 144.96332]}>
// //                     <Popup>
// //                         Popup for any custom information.
// //             </Popup>
// //                 </Marker>
// //             </LeafletMap>
// //         );
// //     }
// // }

// // export default Map

// class GeoJsonMap extends Component {
//     render() {
//         return (
//             <LeafletMap
//                 center={[-37.814, 144.96332]}
//                 zoom={6}
//                 maxZoom={10}
//                 attributionControl={true}
//                 zoomControl={true}
//                 doubleClickZoom={true}
//                 scrollWheelZoom={true}
//                 dragging={true}
//                 animate={true}
//                 easeLinearity={0.35}
//             >
//                 <GeoJSON
//                     data={worldGeoJSON}
//                     style={() => ([
//                         {
//                             "featureType": "all",
//                             "elementType": "all",
//                             "stylers": [
//                                 {
//                                     "visibility": "on"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "all",
//                             "elementType": "labels",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 },
//                                 {
//                                     "saturation": "-100"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "all",
//                             "elementType": "labels.text.fill",
//                             "stylers": [
//                                 {
//                                     "saturation": 36
//                                 },
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 40
//                                 },
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "all",
//                             "elementType": "labels.text.stroke",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 },
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 16
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "all",
//                             "elementType": "labels.icon",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "administrative",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 20
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "administrative",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 17
//                                 },
//                                 {
//                                     "weight": 1.2
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "landscape",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 20
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "landscape",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#4d6059"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "landscape",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#4d6059"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "landscape.natural",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#4d6059"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "poi",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "lightness": 21
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "poi",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#4d6059"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "poi",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#4d6059"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "visibility": "on"
//                                 },
//                                 {
//                                     "color": "#7f8d89"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.highway",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 },
//                                 {
//                                     "lightness": 17
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.highway",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 },
//                                 {
//                                     "lightness": 29
//                                 },
//                                 {
//                                     "weight": 0.2
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.arterial",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 18
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.arterial",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.arterial",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.local",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 16
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.local",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "road.local",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#7f8d89"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "transit",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "color": "#000000"
//                                 },
//                                 {
//                                     "lightness": 19
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "all",
//                             "stylers": [
//                                 {
//                                     "color": "#2b3638"
//                                 },
//                                 {
//                                     "visibility": "on"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "geometry",
//                             "stylers": [
//                                 {
//                                     "color": "#2b3638"
//                                 },
//                                 {
//                                     "lightness": 17
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "geometry.fill",
//                             "stylers": [
//                                 {
//                                     "color": "#24282b"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "geometry.stroke",
//                             "stylers": [
//                                 {
//                                     "color": "#24282b"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "labels",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "labels.text",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "labels.text.fill",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "labels.text.stroke",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         },
//                         {
//                             "featureType": "water",
//                             "elementType": "labels.icon",
//                             "stylers": [
//                                 {
//                                     "visibility": "off"
//                                 }
//                             ]
//                         }
//                     ])}
//                 />
//                 <Marker position={[-37.814, 144.96332]}>
//                     <Popup>
//                         Popup for any custom information.
//           </Popup>
//                 </Marker>
//             </LeafletMap>
//         );
//     }
// }

// export default GeoJsonMap