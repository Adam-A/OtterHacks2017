/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
		$('#start').click(function() {
			$('#otter-start').hide();
			navigator.geolocation.getCurrentPosition(function(position) {
				currentUserCoords = position.coords;
				initialize(position.coords.latitude, position.coords.longitude);
			}, function(error) { alert("Unable to get GPS location: " + error); });
		});
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

var map;
var service;
var infowindow;

var distanceMatrixService = new google.maps.DistanceMatrixService();
var placeService;

var currentUserCoords;
var placesFound = {};
var placeDistances = [];

function initialize(lat,lng) {
  var latlng = new google.maps.LatLng(lat,lng);

  map = new google.maps.Map(document.getElementById('map'), {
      center: latlng,
      zoom: 13
    });

  var request = {
    location: latlng,
    radius: '3000',
    types: ['park', 'beach']
  };
	placeService = new google.maps.places.PlacesService(map);
  placeService.nearbySearch(request, placesCallback);
}

function placesCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < 1; i++) {
      var place = results[i];
	  console.log(place);
	  placesFound[place.place_id] = place;
	  console.log("Name: " + place.name + " | Lat/Lng: " + place.geometry.location.lat() + "," + place.geometry.location.lng())
	  if ( place.photos ) {
		console.log(place.photos[0].getUrl({'maxWidth': 750, 'maxHeight': 500}));
	  }
	  
	  distanceMatrixService.getDistanceMatrix(
	  {
		origins: [new google.maps.LatLng(currentUserCoords.latitude, currentUserCoords.longitude)],
		destinations: [{'placeId': place.place_id}],
		travelMode: 'WALKING',
	  }, distanceMatrixCallback);
	  
	  placeService.getDetails({ placeId: place.place_id }, placeDetailsCallback);
      createMarker(results[i]);
    }
  }
}

function placeDetailsCallback(placeDetails, status) {
	if ( status == google.maps.places.PlacesServiceStatus.OK ) {
		placesFound[placeDetails.place_id]['details'] = placeDetails;
		$('.lightbox').html('');		
	} else {
		console.log("Error retrieving place details: ", status);
	}
}

  function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
	  map: map,
          icon: 'http://i.imgur.com/VUgB2nF.png',
	  position: place.geometry.location
	});
	var contentString = place.name;

    console.log(place);

 	var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
	marker.addListener('click', function() {
		// Info box
		// infowindow.open(map, marker);
		$('.lightbox').show();
        $('.lightbox').slick();
        toastr.info("Swipe to view more photos.")
		//alert('todo: info about selected item');
	});
  }

function distanceMatrixCallback(response, status) {
  // See Parsing the Results for
  // the basics of a callback function.
  placeDistances.push(response);
  for (placeId in placesFound) {
		var place = placesFound[placeId];
	  
		if ( place.details.photos ) {
			for ( var i = 0; i < place.details.photos.length; i++ ) {
				$('.lightbox').append('<div><img class="img-fluid" data-title="' + place.details.name +
									  '" src="' + place.details.photos[i].getUrl({'maxWidth': 750, 'maxHeight': 500}) +
									  '"><div class="card-block"><h4>' + place.details.name + '</h4><h5>This place is ' +
									  response.rows[0].elements[0].distance.text + ' away, a ' + response.rows[0].elements[0].duration.text + ' walk.</h5>' + 
									  '<a class="btn btn-primary" href="' + place.details.url + '">Walking directions via Google</a><br><a class="btn btn-default close-btn">Close</a></div></div>');
			}
		}
		
		break;
  }
  // todo link to placesFound
  console.log(response);
  console.log(response.rows[0].elements[0].duration.text + " to walk " + response.rows[0].elements[0].distance.text + " to " + response.destinationAddresses[0]);
}

$(document).ready(function(){ $('.lightbox').hide(); $(document).on('click', '.close-btn', function(){$('.lightbox').hide();}); });
