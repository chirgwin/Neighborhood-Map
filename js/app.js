var locations = [

          {title: 'The Ridge', location: {lat: 31.1048001, lng: 77.17466779999999}},
          {title: 'Christ Church', location: {lat: 31.104327, lng: 77.17590799999999}},
          {title: 'Rashtrapati Niwas', location: {lat: 31.1035264, lng: 77.14125899999999}},
          {title: 'Mall Road', location: {lat: 31.0988587, lng: 77.17558729999999}},
          {title: 'Kalka_Shimla Railway', location: {lat: 31.02576939999999, lng: 77.1312518}},
          {title: 'Gorton Castle', location: {lat: 31.1046485, lng: 77.16266330000001}},
          {title: 'State Museum', location: {lat: 31.1034073, lng: 77.15080820000001}},
          {title: 'Jakhu Temple', location: {lat: 31.1012356, lng: 77.18387729999999}},
          {title: 'Birds Zoo', location: {lat: 31.1029229, lng: 77.1477524}},
          {title: 'Kufri', location: {lat: 31.0978583, lng: 77.26781369999999}},
          {title: 'Indian Institute of Advanced Study', location: {lat: 31.1036203, lng: 77.14114619999999}}

];

var ViewModel = function() {

    // pointer to outer this

    var self = this;
    this.placesList = ko.observableArray([]);

    var markers = [];
    var marker;
    var map;
    var placeMarkers = [];

    locations.forEach(function(loc) {
              self.placesList.push(loc);
    });

    // set the default current location to start of the array.

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

        var largeInfowindow = new google.maps.InfoWindow();

        var defaultIcon = makeMarkerIcon('ffff24');

        var highlightedIcon = makeMarkerIcon('7ec500');

        var bounds = new google.maps.LatLngBounds();

        // The following group uses the location array to create an array of markers on initialize.

        for (var i = 0; i < locations.length; i++) 
        {

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
                bounce(this);
                populateInfoWindow(this, largeInfowindow);
                
            });
            
            //Animation of markers, this function will stop animation 
            //of the marker which is no longer active.

            function bounce(marker)
            {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){
                    marker.setAnimation(null);
                },3000);
            }

            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });

            marker.addListener('mouseout', function() {
                this.setIcon(null);
            });

        }

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.

        function populateInfoWindow(marker, infowindow) 
        {

            // Check to make sure the infowindow is not already opened on this marker.

            if (infowindow.marker != marker) {

                // Clear the infowindow content to give the streetview time to load.

                infowindow.setContent();
                infowindow.marker = marker;

                // Make sure the marker property is cleared if the infowindow is closed.

                infowindow.addListener('closeclick', function() 
                {
                    if(infowindow.marker != null)
                        infowindow.marker.setAnimation(null);
                    infowindow.marker = null;
                });

                var streetViewService = new google.maps.StreetViewService();

                var radius = 50;  

                var temp = true;
                var ptr = false;    

                var wiki = '';

                var panoramaOptions;
                var heading;
                var nearStreetViewLocation;

                // In case the status is OK, which means the pano was found, compute the
                // position of the streetview image, then calculate the heading, then get a
                // panorama from that and set the options
                function getStreetView(data, status) 
                {
                    if (status == google.maps.StreetViewStatus.OK) 
                    {
                         nearStreetViewLocation = data.location.latLng;
                         heading = google.maps.geometry.spherical.computeHeading(
                            nearStreetViewLocation, marker.position
                            );

                        panoramaOptions = {
                            position: nearStreetViewLocation,
                            pov: {
                                heading: heading,

                                // this changes the angle of camera whether to look up or down.

                                pitch: 30
                            }
                        };
                        var panorama = new google.maps.StreetViewPanorama(
                            document.getElementById('pano'), panoramaOptions
                            );
                    } 
                    else
                    {
                        infowindow.setContent
                        (
                            '<div><h5 id="heading">' + 
                            marker.title + 
                            '</h5></div><div id="wiki-links" >'+
                            wiki +
                            '</div><div><span id = "no_view" >No Street View Found !</span></div>'
                        );
                        temp = false;
                    }
                }

                // Use streetview service to get the closest streetview image within
                // 50 meters of the markers position

                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

                // Open the infowindow on the correct marker.

                infowindow.open(map, marker);

                var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
                        marker.title +
                        '&format=json&callback=wikiCallback';

                var wikiTimeout = setTimeout(function(){
                           wiki.text("failed to get wikipedia resources!");
                }, 8000);
                        
                $.ajax({
                    url:wikiUrl,
                    dataType:"jsonp",

                    //jsonp:"callback", by default, using jsonp as datatype will set the callback function name to callback.
                    // so, no need to mention it again.

                    success:function(response) {
                        ptr = true;
                        for(var k = 1; k < response.length; k++) {
                            var aList = response[k];
                            for(var i = 0; i < aList.length; i++) {
                                aStr = aList[i];
                                if(aStr.length > wiki.length) {
                                    wiki = aStr;
                                }
                            }
                        }
                        
                        if(temp == false)
                        {
                            infowindow.setContent
                            (
                               '<div><h5 id="heading">' + 
                                marker.title + 
                               '</h5></div><div id="wiki-links" >'+
                                wiki +
                               '</div><div><span id = "no_view" >No Street View Found !</span></div>'
                            );
                        }
                        else
                        {
                            infowindow.setContent
                            (
                                '<div><h5 id="heading">' + 
                                marker.title + 
                                '</h5></div><div id="wiki-links">'+
                                wiki +
                                '</div><div id="pano"></div>'
                            );
                            clearTimeout(wikiTimeout);
                            var panorama = new google.maps.StreetViewPanorama(
                                document.getElementById('pano'), panoramaOptions
                            ); 
                        }
                    }
                }).error(function(jqXHR, textStatus) 
                {
                     if (jqXHR.status == 0) 
                     {
                        alert('Not connected.\n Verify Network.');
                     } 
                     else if (jqXHR.status == 404) 
                     {
                        alert('HTML Error Callback.');
                     } 
                     else if (jqXHR.status == 500) 
                     {
                        alert('Internal Server Error [500].');
                     } 
                     else 
                     {
                        alert('Error : \n' + textStatus);
                     }
                });
            }

        }
         
        // This function will loop through the markers array and will display them all.

        function showMarkers() 
        {

            // Extend the boundaries of the map for each marker and display the marker

            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
                 
            }
            map.fitBounds(bounds);
        }

        showMarkers();

        for(var i = 0; i < locations.length; i++) 
        {
            this.placesList()[i].marker = markers[i];
        }
    

        // This function will loop through the listings and hide them all.

        function hideMarkers(markers) 
        {
          for (var i = 0; i < markers.length; i++)
          {
             markers[i].setMap(null);
          }
        }
        

        function makeMarkerIcon(markerColor) 
        {
          var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
          return markerImage;
        }

    };

    this.select = function(LocationClicked) 
    {

        for(var i = 0; i < self.placesList().length; i++) {
            var title = self.placesList()[i].title;
            if(LocationClicked.title == title) {
                this.currLocation = self.placesList()[i];
            }

        }
        if(!this.marker) alert('Searching cannot be done!');
        else 
        {

            this.marker.setAnimation(google.maps.Animation.BOUNCE);

            // open an infoWindow when either a location is selected from 
            // the list view or its map marker is selected directly.

            google.maps.event.trigger(this.marker, 'click');

        }
    };

    // addition of filters for searching the particular location.
    this.searchLoc = ko.observable('');

    this.selector = function(v) 
    {

        self.placesList.removeAll();
        locations.forEach(function(val) {
            var find = val.title.toLowerCase();

            // find match for the starting alphabet for every location 

            if(find.indexOf(v.toLowerCase()) >= 0) 
            {
                self.placesList.push(val);
            }

        });

    };

    this.markerSelector = function(v) 
    {
        locations.forEach(function(val) 
        {
            var flag = val.marker;
            if (flag.setMap(map) !== null) 
            {
                flag.setMap(null);
            }
            var find = flag.title.toLowerCase();
            if (find.indexOf(v.toLowerCase()) >= 0) 
            {
                flag.setMap(map);
            }
        });
    };

    this.searchLoc.subscribe(this.selector);
    this.searchLoc.subscribe(this.markerSelector);
};

mapError = function() 
{
    // Error handling

    alert("This page cannot be loaded.");
};

var VAR = new ViewModel();

// we need to tell knockout to apply our bindings to this viewModel.

ko.applyBindings(VAR);
