var ViewModel = function() {

    // pointer to outer this

    var self = this;
    // FIXME:
    $.ajaxSetup({
        async: false
    });
    $.getJSON("https://sheetsu.com/apis/v1.0su/f7360390fc37", function(data) {
      locations = data;
        // Now use this data to update your view models,
        // and Knockout will update your UI automatically
    });
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

        // Constructor creates a new map - only center and zoom are required.

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 31.1048145, lng: 77.17340329999999},
            zoom: 13,
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

            var position =
            {
              lat: parseInt(locations[i].latitude),
              lng: parseInt(locations[i].longitude)
            };

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
                            var panorama = new google.maps.StreetViewPanorama(
                                document.getElementById('pano'), panoramaOptions
                            );
                        }
                    }
                }).fail(function(jqXHR, textStatus)
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
