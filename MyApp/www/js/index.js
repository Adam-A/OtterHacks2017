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
			$('#start').hide();
			navigator.geolocation.getCurrentPosition(function(position) {
				currentUserCoords = position.coords;
				initialize(position.coords.latitude, position.coords.longitude);
			});
		});
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

var map;
var service;
var infowindow;

var distanceMatrixService = new google.maps.DistanceMatrixService();

var currentUserCoords;

function initialize(lat,lng) {

  map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15
    });

  var request = {
    radius: '3000',
    types: ['park', 'beach']
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, placesCallback);
}

function placesCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < 3; i++) {
      var place = results[i];
	  console.log(place);
	  console.log("Name: " + place.name + " | Lat/Lng: " + place.geometry.location.lat() + place.geometry.location.lng())
	  if ( place.photos ) {
		console.log(place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500}));
	  }
	  distanceMatrixService.getDistanceMatrix(
	  {
		origins: [new google.maps.LatLng(currentUserCoords.latitude, currentUserCoords.longitude)],
		destinations: [place.geometry.location],
		travelMode: 'WALKING',
	  }, distanceMatrixCallback);
      createMarker(results[i]);
    }
  }
}

  function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
	  map: map,
	  position: place.geometry.location
	});
  }
  



function distanceMatrixCallback(response, status) {
  // See Parsing the Results for
  // the basics of a callback function.
  console.log(response);
}