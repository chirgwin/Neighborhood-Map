# Neighborhood-Map

A single-page application featuring a map of your neighborhood made using **Google Map API**.

![image](https://github.com/AnanyaSharma22/Neighborhood-Map/blob/master/pictures/map.PNG)

# Table of Contents

- Quickstart
- Documentation
- Usage
- Helpful Resourses

# Quickstart

An application written in javascript and HTML using google map api. 
The neighborhood map application has many functionalities:

- The home of the applicaton displays two buttons to show and hide markers on the map.
- Then, a button drawing tools which will draw shapes around the which you want to visit.
- Application also searches all the nearby places, you want too visit in a particular area.
- Display map markers identifying at least 5 locations that you are interested in within this neighborhood. This application displays     those locations when the user click on show-listings function.
- A list view of the set of locations is implemented. This list of locations is displayed by default when the page is loaded and when     user click on any option on the list that location is dsiplayed on the map.
- This app also shows a street view image of the location user want to select.
- In the application, map is also styled using various map stylers.

![image1](https://github.com/AnanyaSharma22/Neighborhood-Map/blob/master/pictures/map_1.PNG)

# Documentation

Application utilizes Google Map API and at least one additional third-party API. All data requests are retrieved and maintained in an asynchronous manner. If searching od data is failed, errors are also handled.

Third Party API Used:  StreetView images

Framework Used: Knockout

# Usage

- Download the project.
- Open index.html file in the browser to view the application
- Click on the Show Listings button to view the markers of all the locations mentioned in the locations list and to hid the markers       click on Hide Listings button.
- To draw a particular area to visit, click on Draw tools button.
- By clicking on the marker, a street view of location will appear.
- User can search the particular location, user wants to visit.
- By clicking on any location on the list, streetview for that particular location will be displayed.

![image2](https://github.com/AnanyaSharma22/Neighborhood-Map/blob/master/pictures/map_3.PNG)

# Helpul Resources

- [Google Maps Developer Docmentation](https://developers.google.com/maps/documentation/javascript/tutorial)
- [KnockoutJS Tutorials](http://knockoutjs.com/)
- [Google Maps Street View Service](https://developers.google.com/maps/documentation/javascript/streetview)
