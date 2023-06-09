import { useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import $ from 'jquery';

export default function ClubLocatorMap({ showDialog, closeClick, clubLocatorMapSnowmobileId, googleMapKey, selectClubFromClubLocatorMapSelection }
    : {
        showDialog: boolean,
        closeClick: Function,
        clubLocatorMapSnowmobileId: string,
        googleMapKey: string | undefined,
        selectClubFromClubLocatorMapSelection: Function
    }) {

    const [errorMessage, setErrorMessage] = useState("");

    const selectedClub = useRef(undefined as string | undefined);

    if (window.google == undefined) {
        $.getScript(`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=${googleMapKey}`, function () {
            initializeMap();
        });
    } else {
        initializeMap();
    }

    return (
        <>
            <Modal show={showDialog} onHide={() => cancelClick()} backdrop="static" keyboard={false} dialogClassName="modal-width-75-percent">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Club Locator Map
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        {errorMessage !== "" && (
                            <div className="row">
                                <div className="col-12">
                                    <div className="alert alert-danger" role="alert">
                                        {""}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div id="loading-indicator" className="row">
                            <div className="col-12">
                                <div className="d-flex justify-content-center align-items-center m-3">
                                    <div className="me-4">
                                        <i className="fa-solid fa-spinner fa-spin fa-2xl"></i>
                                    </div>
                                    <div>
                                        Loading map. Please wait.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="map-area" style={{ display: "none" }}>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-3">
                                        <label htmlFor="club-locator-map-input" className="form-label">
                                            Search for the location where you plan on doing most of your riding this season.
                                        </label>

                                        <div className="input-group">
                                            <input id="club-locator-map-input" type="email" className="form-control" placeholder="Enter city, town, postal code, or address" />
                                            <button id="search-button" className="btn btn-outline-primary" style={{ minWidth: "70px", borderRight: "none" }} type="button">
                                                <i className="fa-solid fa-magnifying-glass"></i>
                                            </button>
                                            <button id="reset-button" className="btn btn-outline-primary" style={{ minWidth: "70px" }} type="button">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>

                                        <div id="club-locator-map-input-message" className="text-danger mt-1"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div id="map-canvas" className="w-100" style={{ position: 'relative', overflow: 'hidden' }}>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="text-center fw-semibold mt-2">
                                        Selected Club: <span id="selected-club">Please select a club from the map above</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col">
                                {/* <span className="text-danger me-1">*</span>= mandatory field */}
                            </div>
                            <div className="col d-flex justify-content-end">
                                <Button className="me-2" variant="primary" onClick={() => selectClick()}>Select</Button>
                                <Button variant="primary" onClick={() => cancelClick()}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal >
        </>
    )

    function selectClick(): void {
        if (selectClubFromClubLocatorMapSelection != undefined && closeClick != undefined) {
            selectClubFromClubLocatorMapSelection(clubLocatorMapSnowmobileId, selectedClub.current);
            closeClick();
        }
    }

    function cancelClick(): void {
        if (closeClick != undefined) {
            closeClick();
        }
    }

    function initializeMap(): void {
        let map: google.maps.Map;
        let mapData: any;
        let mapdata_loaded: boolean = false;
        let clubMarkers: any[];
        let clubPolys: any[];
        let hereMarker: google.maps.Marker;

        const colors = ['#3aa6d0', '#62b1d0', '#0776a0', '#226078', '#024c68', '#bf9630', '#a67600', '#bf4930', '#a61d00', '#ffb600', '#ff2c00', '#ffc840', '#ffd773', '#ff6140', '#ff8b73'];

        const mapStyle = [
            { "featureType": "landscape", "stylers": [{ "hue": "#F1FF00" }, { "saturation": -27.4 }, { "lightness": 9.4 }, { "gamma": 1 }] },
            { "featureType": "road.highway", "stylers": [{ "hue": "#0099FF" }, { "saturation": -20 }, { "lightness": 36.4 }, { "gamma": 1 }] },
            { "featureType": "road.arterial", "stylers": [{ "hue": "#00FF4F" }, { "saturation": 0 }, { "lightness": 0 }, { "gamma": 1 }] },
            { "featureType": "road.local", "stylers": [{ "hue": "#FFB300" }, { "saturation": -38 }, { "lightness": 11.2 }, { "gamma": 1 }] },
            { "featureType": "water", "stylers": [{ "hue": "#00B6FF" }, { "saturation": 4.2 }, { "lightness": -63.4 }, { "gamma": 1 }] },
            { "featureType": "poi", "stylers": [{ "hue": "#9FFF00" }, { "saturation": 0 }, { "lightness": 0 }, { "gamma": 1 }] }
        ];

        const image = {
            url: './blue-marker.png',
            size: new google.maps.Size(16, 16),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(8, 8)
        };

        // This function is called when a location is submitted in the input form.
        function codeAddress() {
            const searchValue: string = $('#club-locator-map-input')?.val()?.toString()?.trim() ?? "";

            if (searchValue !== "") {
                $("#club-locator-map-input-message").empty();

                resetMap();

                const geocoder: google.maps.Geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': searchValue + ', ONTARIO CANADA' }, function (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results != undefined && results.length > 0) {
                            // Center map at coordinates.
                            map.setCenter(results[0].geometry.location);

                            const locOut: google.maps.LatLng = results[0].geometry.location;

                            // Place marker at coordinates.
                            hereMarker.setPosition(locOut);
                            hereMarker.setMap(map);

                            // Find closest clubs to coordinates.
                            findCloseClubs(map, locOut);
                        }
                    } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                        $("#club-locator-map-input-message").append("Sorry, we couldn't find the location you entered.");
                    } else {
                        $("#club-locator-map-input-message").append("Sorry, there was a problem searching for your location.");
                    }
                });
            }
        }

        function findCloseClubs(map: google.maps.Map, origin: google.maps.LatLng) {
            const closestClubs: number[] = [];
            const clubSearchLimit: number = 20;
            const distances: number[] = [];

            // calculate club distances from location and populate distance array
            for (let z: number = 0; z < clubMarkers.length; z++) {
                const club: any = clubMarkers[z];
                const latLng: any = club.getPosition();
                const distance: number = getDistance(latLng, origin);
                distances.push(distance);
            }

            // iterate through all clubs
            for (let limit: number = 0; limit < clubSearchLimit; limit++) {
                let closestDistance: number = 50000;
                let closestIndex: number | undefined = undefined;

                for (let i: number = 0; i < clubMarkers.length; i++) {
                    if (distances[i] < closestDistance) {
                        let alreadyUsed: boolean = false;

                        for (let y: number = 0; y < closestClubs.length; y++) {
                            if (i === closestClubs[y]) {
                                alreadyUsed = true;
                            }
                        }

                        if (!alreadyUsed) {
                            closestDistance = distances[i];
                            closestIndex = i;
                        }
                    }
                }

                if (closestIndex != undefined) {
                    closestClubs.push(closestIndex);
                }
            }

            resetMap();

            // Iterate through closest clubs and add to map.
            for (let i: number = 0; i < closestClubs.length; i++) {
                const index: number = closestClubs[i];
                toggleClub(index);
            }

            map.panTo(origin);
            setTimeout(() => { map.setZoom(8); }, 100);
        }

        function drawAllClubs(): void {
            // Iterate through clubs and draw their polgons
            for (let i: number = 0; i < mapData.clubs.length; i++) {
                const paths: any[] = mapData.clubs[i].paths;

                for (let y: number = 0; y < paths.length; y++) {
                    drawPoly(paths[y], i);
                }

                drawCenter(mapData.clubs[i].loc, mapData.clubs[i].name, i);
            }
        }

        function toggleClub(i: number): void {
            if (clubMarkers[i].map == null) {
                clubMarkers[i].setMap(map);
                clubPolys[i].setMap(map);
            } else {
                clubMarkers[i].setMap(null);
                clubPolys[i].setMap(null);
            }
        }

        function showAll(): void {
            for (let i: number = 0; i < clubMarkers.length; i++) {
                clubMarkers[i].setMap(map);
                clubPolys[i].setMap(map);
            }
        }

        function resetMap(): void {
            for (let i: number = 0; i < clubMarkers.length; i++) {
                clubMarkers[i].setMap(null);
                clubPolys[i].setMap(null);
            }
        }

        function closeInfoWindows(): void {
            if (clubPolys != undefined && clubPolys.length > 0) {
                for (let x: number = 0; x < clubPolys.length; x++) {
                    clubPolys[x].infoWindow.close();
                    unhighlightClub(x);
                }
            }
        }

        function showClubLink(i: number): void {
            closeInfoWindows();

            highlightClub(i);
            clubPolys[i].infoWindow.open(map, clubMarkers[i]);

            $("#selected-club").empty();
            $("#selected-club").append(mapData.clubs[i].name);

            selectedClub.current = mapData.clubs[i].name;
        }

        function highlightClub(i: number): void {
            clubMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
            clubMarkers[i].setVisible(true);
        }

        function unhighlightClub(i: number): void {
            clubMarkers[i].setAnimation(null);
            clubMarkers[i].setVisible(false);
        }

        function drawClub(i: number): void {
            const paths = mapData.clubs[i].paths;

            for (let y: number = 0; y < paths.length; y++) {
                drawPoly(paths[y], i);
            }

            drawCenter(mapData.clubs[i].loc, mapData.clubs[i].name, i);
        }

        function drawCenter(coords: any[], title: string, index: number): void {
            const latLng: google.maps.LatLng = new google.maps.LatLng(coords[0], coords[1]);

            clubMarkers[index] = new google.maps.Marker({
                position: latLng,
                title: title,
            });

            clubMarkers[index].setVisible(false);
        }

        function drawPoly(path: any[], index: number): void {
            const coords: any[] = [];

            for (let i: number = 0; i < path.length; i++) {
                coords.push(new google.maps.LatLng(path[i].lat, path[i].lng))
            }

            const rand: number = Math.floor(Math.random() * colors.length);
            const fillCol: string = colors[rand];

            clubPolys[index] = new google.maps.Polygon({
                paths: coords,
                strokeColor: '#222222',
                strokeOpacity: 1,
                strokeWeight: 1.5,
                fillColor: fillCol,
                fillOpacity: 0.6,
                zIndex: 0,
            });

            clubPolys[index].infoWindow = new google.maps.InfoWindow({
                content: '<p class="m-0" style="min-width:300px;white-space:nowrap">' + mapData.clubs[index].name + '</p>'
            });

            google.maps.event.addListener(map, "click", function () {
                closeInfoWindows();

                selectedClub.current = undefined;
                $("#selected-club").empty();
                $("#selected-club").append("Please select a club from the map above");
            });

            google.maps.event.addListener(clubPolys[index], "click", function () {
                showClubLink(index);
            });
        }

        // These functions handle calculating distance between two points.
        function getDistance(first: any, second: any) {
            // Haversine formula to calculate distance between two points.
            const R: number = 6378137; // Earth's mean radius in meters
            const dLat: number = rad(second.lat() - first.lat());
            const dLong: number = rad(second.lng() - first.lng());
            const a: number = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(first.lat())) * Math.cos(rad(second.lat())) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
            const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d: number = R * c;

            // Returns the distance in km.
            return d / 1000;
        }

        function rad(x: number): number {
            return x * Math.PI / 180;
        }

        function parseCoordString(coords: string): any[] {
            const returnObj: any[] = [];
            const pairs = coords.split(" ");

            if (pairs != undefined && pairs.length > 0) {
                for (let i: number = 0; i < pairs.length; i++) {
                    const splitPair: string[] = pairs[i].split(",");
                    const pair: { lng: string, lat: string } = {} as { lng: string, lat: string };
                    pair.lng = splitPair[0];
                    pair.lat = splitPair[1];
                    returnObj.push(pair);
                }
            }

            return returnObj;
        }

        function parseKML(): void {
            // Get kml file in json form, parse it, draw club poly data.
            $.getJSON("./map_data_093015_for2022.txt", function (json: any) {
                const placemarks = json.Document.Folder.Placemark;

                mapData = {};
                mapData.clubs = [];

                for (let i: number = 0; i < placemarks.length; i++) {
                    const club: any = {};

                    club.name = placemarks[i].ExtendedData.SchemaData.SimpleData[0];
                    club.website = placemarks[i].ExtendedData.SchemaData.SimpleData[2];
                    club.paths = [];
                    club.loc = [];

                    // Polygon is comprised of a single path.
                    if (placemarks[i].Polygon != undefined) {
                        const brokenPath: any[] = parseCoordString(placemarks[i].Polygon.outerBoundaryIs.LinearRing.coordinates);
                        club.paths.push(brokenPath);
                    }

                    // Polygon is made up of multiple paths.
                    else {
                        const polygon: any[] = placemarks[i].MultiGeometry.Polygon;

                        for (let y: number = 0; y < polygon.length; y++) {
                            const brokenPath: any[] = parseCoordString(polygon[y].outerBoundaryIs.LinearRing.coordinates);
                            club.paths.push(brokenPath);
                        }
                    }

                    club.loc[0] = placemarks[i].ExtendedData.SchemaData.SimpleData[5];
                    club.loc[1] = placemarks[i].ExtendedData.SchemaData.SimpleData[6];

                    mapData.clubs.push(club);
                }

                mapdata_loaded = true;
            });
        }

        function initializeIt(): void {
            if (!mapdata_loaded) {
                setTimeout(() => { initializeIt(); }, 100);
                return;
            }

            $('#club-locator-map-input').val("");
            $("#club-locator-map-input-message").empty();

            selectedClub.current = undefined;
            $("#selected-club").empty();
            $("#selected-club").append("Please select a club from the map above");

            closeInfoWindows();

            // Define geographic location to center map at.
            const latlng: google.maps.LatLng = new google.maps.LatLng(46.846224, -83.952648);

            if (map == undefined) {
                const mapDiv: HTMLElement | undefined = $("#map-canvas")[0];

                if (mapDiv != undefined) {
                    mapDiv.style.height = "300px";

                    const mapOptions: google.maps.MapOptions = {
                        center: latlng,
                        zoom: 5,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        styles: mapStyle,
                        disableDefaultUI: true,
                        zoomControl: true,
                        scrollwheel: false,
                    };

                    map = new google.maps.Map(mapDiv, mapOptions);
                    clubMarkers = [];
                    clubPolys = [];

                    drawAllClubs();

                    hereMarker = new google.maps.Marker({
                        position: latlng,
                        title: 'Your search returned this location',
                        icon: image,
                        draggable: false
                    });

                    // google.maps.event.addListener(hereMarker, 'dragend', function (event: any) {
                    //     findCloseClubs(map, this.getPosition());
                    // });

                    showAll();
                }
            } else {
                showAll();

                map.setZoom(5);
                map.setCenter(latlng);
            }

            //setMapsLoaded(true);
            $("#loading-indicator").hide();
            $("#map-area").show();
        }

        $("#club-locator-map-input").on("keypress", function (event: any) {
            if (event.keyCode === 13) {
                event.preventDefault();
                codeAddress();
            }
        });

        $("#search-button").on("click", function () {
            codeAddress();
        });

        $("#reset-button").on("click", function () {
            initializeIt();
        });

        parseKML();
        initializeIt();
    }
}
