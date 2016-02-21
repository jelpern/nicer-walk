var map;

detectBrowser = function() {
	var useragent = navigator.userAgent;
	var mapdiv = document.getElementById("map");

	if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1) {
		mapdiv.style.width = '100%';
		mapdiv.style.height = '100%';
	} else {
		mapdiv.style.width = '600px';
		mapdiv.style.height = '800px';
	}
	console.log(useragent);
};

//detectBrowser();

/*** TODO:  
1. Catch routes returned;
2. Examine each leg;
3. Figure out how to match each leg against the tree database;
4. Score each leg;
5. Displays scores to user;
6. Recommend a route.
*/

function initMap() {
	var origin_place_id = null;
	var destination_place_id = null;
	var travel_mode = google.maps.TravelMode.WALKING;

	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeControl: false,
		center: {
			lat: 40.730610,
			lng: -73.935242
		},
		zoom: 13
	});
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;
	directionsDisplay.setMap(map);

	var origin_input = document.getElementById('origin-input');
	var destination_input = document.getElementById('destination-input');
	var modes = document.getElementById('mode-selector');

	map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

	var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
	origin_autocomplete.bindTo('bounds', map);
	var destination_autocomplete =
		new google.maps.places.Autocomplete(destination_input);
	destination_autocomplete.bindTo('bounds', map);

	// Sets a listener on a radio button to change the filter type on Places
	// Autocomplete.
	function setupClickListener(id, mode) {
		var radioButton = document.getElementById(id);
		radioButton.addEventListener('click', function() {
			travel_mode = mode;
		});
	}
	setupClickListener('changemode-walking', google.maps.TravelMode.WALKING);
	setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
	setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING);

	function expandViewportToFitPlace(map, place) {
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(17);
		}
	}

	origin_autocomplete.addListener('place_changed', function() {
		var place = origin_autocomplete.getPlace();
		if (!place.geometry) {
			window.alert("Autocomplete's returned place contains no geometry");
			return;
		}
		expandViewportToFitPlace(map, place);

		// If the place has a geometry, store its place ID and route if we have
		// the other place ID
		origin_place_id = place.place_id;
		route(origin_place_id, destination_place_id, travel_mode,
			directionsService, directionsDisplay);
	});

	destination_autocomplete.addListener('place_changed', function() {
		var place = destination_autocomplete.getPlace();
		if (!place.geometry) {
			window.alert("Autocomplete's returned place contains no geometry");
			return;
		}
		expandViewportToFitPlace(map, place);

		// If the place has a geometry, store its place ID and route if we have
		// the other place ID
		destination_place_id = place.place_id;
		route(origin_place_id, destination_place_id, travel_mode,
			directionsService, directionsDisplay);
	});

	function route(origin_place_id, destination_place_id, travel_mode,
		directionsService, directionsDisplay) {
		if (!origin_place_id || !destination_place_id) {
			return;
		}
		directionsService.route({
			origin: {
				'placeId': origin_place_id
			},
			destination: {
				'placeId': destination_place_id
			},
			travelMode: travel_mode,
			provideRouteAlternatives: true
		}, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				console.log(response);
			} else {
				window.alert('Directions request failed due to ' + status);
			}
		});
	}

	var infoWindow = new google.maps.InfoWindow({
		map: map
	});

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			map.setCenter(pos);
		}, function() {
			handleLocationError(true, infoWindow, map.getCenter());
		});
	} else {
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');
}




/*request = {
	origin: LatLng | String | google.maps.Place,
	destination: LatLng | String | google.maps.Place,
	travelMode: TravelMode,
	transitOptions: TransitOptions,
	drivingOptions: DrivingOptions,
	unitSystem: UnitSystem,
	waypoints[]: DirectionsWaypoint,
	optimizeWaypoints: Boolean,
	provideRouteAlternatives: Boolean,
	avoidHighways: Boolean,
	avoidTolls: Boolean,
	region: String
}*/
