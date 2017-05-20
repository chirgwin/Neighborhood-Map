var locations = [

          {title: 'The Ridge', location: {lat: 31.1048001, lng: 77.17466779999999}},
          {title: 'Christ Church', location: {lat: 31.104327, lng: 77.17590799999999}},
          {title: 'Rashtrapati Niwas', location: {lat: 31.1035264, lng: 77.14125899999999}},
          {title: 'Mall Road', location: {lat: 31.0988587, lng: 77.17558729999999}},
          {title: 'Jakhu Temple', location: {lat: 31.1012356, lng: 77.18387729999999}},
          {title: 'Shimla Reserve Forest Sanctuary', location: {lat: 31.0999287, lng: 77.2462628}},
          {title: 'Kufri', location: {lat: 31.0978583, lng: 77.26781369999999}},
          {title: 'Kalka_Shimla Railway', location: {lat: 31.02576939999999, lng: 77.1312518}},
          {title: 'Himachal State Museum', location: {lat: 31.10337, lng: 77.150837}}
];

var ViewModel = function() {

	// pointer to outer this

	var self = this;
    this.placesList = ko.observableArray([]);

    var markers = [];
    var marker;
    var map;
    var placeMarkers = [];
    var polygon = null;

    locations.forEach(function(loc) {
              self.placesList.push(loc);
    });

    // set the default current location

    this.currLocation = ko.observable(this.placesList()[0]);

    ViewModel.prototype.initMap = function() {

        //map styling array

        var styles = [
          {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
          {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
          {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
          {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
          },
          {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
          },
          {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
          },
          {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
          },
          {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
          },
          {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
          },
          {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
          },
          {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
          },
          {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
          },
          {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
          },
          {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
          },
          {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
          },
          {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
          },
          {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
          },
          {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
          }
        ];

        // Constructor creates a new map - only center and zoom are required.

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 31.1048145, lng: 77.17340329999999},
            zoom: 13,
            styles: styles,
            mapTypeControl: false
        });

        map = this.map;
        
        // Create a searchbox in order to execute a places search

        var searchBox = new google.maps.places.SearchBox(
            document.getElementById('places-search'));

        // Bias the searchbox to within the bounds of the map.

        searchBox.setBounds(map.getBounds());    

        var largeInfowindow = new google.maps.InfoWindow();

        // Initialize the drawing manager.

        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
          }
        });

        var defaultIcon = makeMarkerIcon('7ec500');

        var highlightedIcon = makeMarkerIcon('ffff24');

        var bounds = new google.maps.LatLngBounds();

        // The following group uses the location array to create an array of markers on initialize.

        for (var i = 0; i < locations.length; i++) {

            // Get the position from the location array.

            var position = locations[i].location;
            var title = locations[i].title;

            // Create a marker per location, and put into markers array.

            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
            });

            // Push the marker to our array of markers.

            markers.push(marker);

            // Create an onclick event to open the large infowindow at each marker.

            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });

            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });

            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });

        }

        document.getElementById('show-listings').addEventListener('click', showListings);

        document.getElementById('hide-listings').addEventListener('click', function() {
                hideMarkers(markers);
        });

        document.getElementById('toggle-drawing').addEventListener('click', function() {
                toggleDrawing(drawingManager);
        });

        // Listen for the event fired when the user selects a prediction from the
        // picklist and retrieve more details for that place.

        searchBox.addListener('places_changed', function() {
              searchBoxPlaces(this);
        });

        // Listen for the event fired when the user selects a prediction and clicks
        // "go" more details for that place.

        document.getElementById('go-places').addEventListener('click', textSearchPlaces);

        // Add an event listener so that the polygon is captured,  call the
        // searchWithinPolygon function. This will show the markers in the polygon,
        // and hide any outside of it.

        drawingManager.addListener('overlaycomplete', function(event) {

          // First, check if there is an existing polygon.
          // If there is, get rid of it and remove the markers

          if (polygon) {
            polygon.setMap(null);
            hideListings(markers);
          }

          // Switching the drawing mode to the HAND (i.e., no longer drawing).

          drawingManager.setDrawingMode(null);

          // Creating a new editable polygon from the overlay.

          polygon = event.overlay;
          polygon.setEditable(true);

          // Searching within the polygon.

          searchWithinPolygon();

          // Make sure the search is re-done if the poly is changed.

          polygon.getPath().addListener('set_at', searchWithinPolygon);
          polygon.getPath().addListener('insert_at', searchWithinPolygon);

        });
    

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.

        function populateInfoWindow(marker, infowindow) {

            // Check to make sure the infowindow is not already opened on this marker.

            if (infowindow.marker != marker) {

                // Clear the infowindow content to give the streetview time to load.

                infowindow.setContent();
                infowindow.marker = marker;

                // Make sure the marker property is cleared if the infowindow is closed.

                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });

                var streetViewService = new google.maps.StreetViewService();
                var radius = 50;

                // In case the status is OK, which means the pano was found, compute the
                // position of the streetview image, then calculate the heading, then get a
                // panorama from that and set the options
                function getStreetView(data, status) {

                     if (status == google.maps.StreetViewStatus.OK)
                    {
                         var nearStreetViewLocation = data.location.latLng;
                         var heading = google.maps.geometry.spherical.computeHeading(
                            nearStreetViewLocation, marker.position);
                            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                            var panoramaOptions = {
                               position: nearStreetViewLocation,
                               pov: {
                                    heading: heading,
                                    pitch: 30
                               }
                            };

                        var panorama = new google.maps.StreetViewPanorama(
                          document.getElementById('pano'), panoramaOptions);

                   } 

                   else 

                   {
                      infowindow.setContent('<div>' + marker.title + '</div>' +
                      '<div>No Street View Found</div>');
                   }

                }

                // Use streetview service to get the closest streetview image within
                // 50 meters of the markers position

                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

                // Open the infowindow on the correct marker.

                infowindow.open(map, marker);
            }

        }

        // This function will loop through the markers array and display them all.
        function showListings() {
            // Extend the boundaries of the map for each marker and display the marker
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
                 
            }
            map.fitBounds(bounds);
        }
       
        for(var i = 0; i < locations.length; i++) {
            this.placesList()[i].marker = markers[i];
        }
    

        // This function will loop through the listings and hide them all.

        function hideMarkers(markers) {
          for (var i = 0; i < markers.length; i++) {
             markers[i].setMap(null);
          }
        }


        function makeMarkerIcon(markerColor) {
          var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
          return markerImage;
        }

        // This shows and hides (respectively) the drawing options.

        function toggleDrawing(drawingManager) {
          if (drawingManager.map) {
            drawingManager.setMap(null);

            // In case the user drew anything, get rid of the polygon

            if (polygon !== null) {
             polygon.setMap(null);
           }

          }

          else 

          {
             drawingManager.setMap(map);
          }

        } 

        // This function hides all markers outside the polygon,
        // and shows only the ones within it. This is so that the
        // user can specify an exact area of search.

        function searchWithinPolygon() {
          for (var i = 0; i < markers.length; i++) {
             if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
               markers[i].setMap(map);
             } 
             else
             {
                markers[i].setMap(null);
             }
          }
        }  

        // This function fires when the user selects a searchbox picklist item.
        // It will do a nearby search using the selected query string or place.

        function searchBoxPlaces(searchBox) {
           hideMarkers(placeMarkers);
           var places = searchBox.getPlaces();
           if (places.length == 0) {
             window.alert('We did not find any places matching that search!');
           } 
           else 
           {
              // For each place, get the icon, name and location.

              createMarkersForPlaces(places);
           } 
        }

        // This function firest when the user select "go" on the places search.
        // It will do a nearby search using the entered query string or place.

        function textSearchPlaces() {
          var bounds = map.getBounds();
          hideMarkers(placeMarkers);
          var placesService = new google.maps.places.PlacesService(map);
          placesService.textSearch({
            query: document.getElementById('places-search').value,
            bounds: bounds
          }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
               createMarkersForPlaces(results);
            }
          });
        }

        // This function creates markers for each place found in either places search.

        function createMarkersForPlaces(places) {
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var icon = {
              url: place.icon,
              size: new google.maps.Size(35, 35),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(15, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.

            var marker = new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location,
              id: place.place_id
            });

            // Create a single infowindow to be used with the place details information
            // so that only one is open at once.

            var placeInfoWindow = new google.maps.InfoWindow();

            // If a marker is clicked, do a place details search on it in the next function.

            marker.addListener('click', function() {
              if (placeInfoWindow.marker == this) {
                console.log("This infowindow already is on this marker!");
              } else {
                getPlacesDetails(this, placeInfoWindow);
              }
            });
            placeMarkers.push(marker);
            if (place.geometry.viewport) {

              // Only geocodes have viewport.

              bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
          }
          map.fitBounds(bounds);
        }

        // This is the PLACE DETAILS search - it's the most detailed so it's only
        // executed when a marker is selected, indicating the user wants more
        // details about that place.

        function getPlacesDetails(marker, infowindow) {
           var service = new google.maps.places.PlacesService(map);
           service.getDetails({
             placeId: marker.id
           }, function(place, status) {
           if (status === google.maps.places.PlacesServiceStatus.OK) {

            // Set the marker property on this infowindow so it isn't created again.

            infowindow.marker = marker;
            var innerHTML = '<div>';
            if (place.name) {
              innerHTML += '<strong>' + place.name + '</strong>';
            }
            if (place.formatted_address) {
              innerHTML += '<br>' + place.formatted_address;
            } 
            if (place.formatted_phone_number) {
              innerHTML += '<br>' + place.formatted_phone_number;
            }
            if (place.opening_hours) {
              innerHTML += '<br><br><strong>Hours:</strong><br>' +
                place.opening_hours.weekday_text[0] + '<br>' +
                place.opening_hours.weekday_text[1] + '<br>' +
                place.opening_hours.weekday_text[2] + '<br>' +
                place.opening_hours.weekday_text[3] + '<br>' +
                place.opening_hours.weekday_text[4] + '<br>' +
                place.opening_hours.weekday_text[5] + '<br>' +
                place.opening_hours.weekday_text[6];
            }
            if (place.photos) {
              innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
            }
            innerHTML += '</div>';
            infowindow.setContent(innerHTML);
            infowindow.open(map, marker);

            // Make sure the marker property is cleared if the infowindow is closed.

            infowindow.addListener('closeclick', function() {
               infowindow.marker = null;
            });
          }
        });
      }

    };

    this.selectedLocation = function(LocClicked) {

        for(var i = 0; i < self.placesList().length; i++) {
            var title = self.placesList()[i].title;
            if(LocClicked.title == title) {
                this.currLocation = self.placesList()[i];
            }

        }
        if(!this.marker) alert('Something went wrong!');
        else {

            this.marker.setAnimation(google.maps.Animation.BOUNCE);

            // open an infoWindow when either a location is selected from 
            // the list view or its map marker is selected directly.

            google.maps.event.trigger(this.marker, 'click');

        }
    };

    // addition of filters
    this.searchedLocation = ko.observable('');

    this.filter = function(value) {

        self.placesList.removeAll();
        locations.forEach(function(val) {
            var searchQuery = val.title.toLowerCase();

            // find match for the starting alphabet for every location 

            if(searchQuery.indexOf(value.toLowerCase()) >= 0) {
                self.placesList.push(val);
            }

        });

    };

    this.searchedLocation.subscribe(this.filter);
};

mapError = function() {

    // Error handling

    alert("This page cannot be loaded at this time.")
};

var VAR = new ViewModel();

// we'll need to tell knockout to apply our bindings to this viewModel

ko.applyBindings(VAR);