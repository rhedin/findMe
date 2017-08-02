var mvmModule = require("./main-view-model");
var permissions = require("nativescript-permissions");
var mapsModule = require("nativescript-google-maps-sdk");
var application = require("application");
var Color = require("color").Color;
var style = require('./map-style.json');
var style2 = require('./map-style-2.json');

function wait(milliSeconds) {
    return new Promise(function(resolve, reject) {
        setTimeout(function(){
           resolve(milliSeconds);
        }, milliSeconds);
    });
}

function requestPermissions() {
  return new Promise(function(resolve, reject) {
    if (!application.android) return resolve(true);
    permissions.requestPermission([
          android.Manifest.permission.ACCESS_FINE_LOCATION,
          android.Manifest.permission.ACCESS_COARSE_LOCATION],
        "This demo will stink without these...")
        .then(function (result) {
          console.log("Permissions granted!");
          resolve(true);
        })
        .catch(function (result) {
          console.log("Permissions failed :(", result);
          resolve(false);
        });

  });
}

function printUISettings(settings) {
  console.log("Current UI setting:\n" + JSON.stringify({
                compassEnabled: settings.compassEnabled,
                indoorLevelPickerEnabled: settings.indoorLevelPickerEnabled,
                mapToolbarEnabled: settings.mapToolbarEnabled,
                myLocationButtonEnabled: settings.myLocationButtonEnabled,
                rotateGesturesEnabled: settings.rotateGesturesEnabled,
                scrollGesturesEnabled: settings.scrollGesturesEnabled,
                tiltGesturesEnabled: settings.tiltGesturesEnabled,
                zoomControlsEnabled: settings.zoomControlsEnabled,
                zoomGesturesEnabled: settings.zoomGesturesEnabled
  }, undefined, 2));
}

function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = mvmModule.mainViewModel;
}

var mapView = null;

function onMapReady(args) {
    mapView = args.object;

    console.log("onMapReady");
    mapView.settings.compassEnabled = true;
    printUISettings(mapView.settings);


    console.log("Setting a marker...");
    var marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(-33.86, 151.20);
    marker.title = "Sydney";
    marker.snippet = "Australia";
    marker.color = "green";
    marker.userData = {index: 1};
    mapView.addMarker(marker);

    console.log(`creating and adding a circle`);
    var circle = new mapsModule.Circle();
    circle.center = mapsModule.Position.positionFromLatLng(-33.42, 151.32);
    circle.visible = true;
    circle.radius = 5000;
    circle.fillColor = new Color('#99ff8800');
    circle.strokeColor = new Color('#99ff0000');
    circle.strokeWidth = 2;
    mapView.addCircle(circle);

    console.log(`creating and adding a polyline`);
    var polyline = new mapsModule.Polyline();
    var point = mapsModule.Position.positionFromLatLng(-32.89, 151.44);
    polyline.addPoints([
        mapsModule.Position.positionFromLatLng(-33.86, 151.20),
        point,
        mapsModule.Position.positionFromLatLng(-33.42, 151.32)
    ]);
    polyline.visible = true;
    polyline.width = 8;
    polyline.color = new Color('#DD00b3fd');
    polyline.geodesic = true;
    mapView.addPolyline(polyline);

    console.log(`creating and adding a polygon`);
    var polygon = new mapsModule.Polygon();
    polygon.addPoints([
        mapsModule.Position.positionFromLatLng(-33.86, 151.20),
        mapsModule.Position.positionFromLatLng(-33.89, 151.40),
        mapsModule.Position.positionFromLatLng(-34.22, 151.32)
    ]);
    polygon.visible = true;
    polygon.fillColor = new Color('#9970d0a0');
    polygon.strokeColor = new Color('#9900d0a0');
    polygon.strokeWidth = 5;
    mapView.addPolygon(polygon);

    console.log(`creating and adding a marker`);
    marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(-33.42, 151.32);
    marker.title = "Gosford";
    marker.snippet = "Australia";

    // var icon = new Image();
    // icon.imageSource = imageSource.fromResource('icon');
    // marker.icon = icon;

    // marker.icon = 'icon';

    marker.alpha = 0.6;
    marker.flat = true;
    marker.anchor = [0.5, 0.5];
    marker.draggable = true;
    marker.visible = false;
    marker.userData = {index: 2};
    mapView.addMarker(marker);

  console.log(`about to start the requestPermissions chain of promises`);
  requestPermissions()
    .then(function(granted) {
        if(granted) {
            console.log("Enabling My Location..");
            mapView.myLocationEnabled = true;
            mapView.settings.myLocationButtonEnabled = true;
        }
        return wait(3000);
    }).then(function () {
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 2;
        });  // Synchronous, it seems.
        console.log("Moving marker...", marker.userData);
        marker.position = mapsModule.Position.positionFromLatLng(-33.33, 151.08);
        marker.rotation = 45;
        console.log("Removing Point from polyline...", polyline, point);
        polyline.removePoint(point);
        return wait(3000);
    }).then(function () {
        mvmModule.mainViewModel.set("zoom", 9);
        console.log("Zooming in...", mvmModule.mainViewModel);
        return wait(3000);
    }).then(function () {
        polyline.addPoint(mapsModule.Position.positionFromLatLng(-33.33, 151.08));
        console.log("Adding point to Polyline...", polyline);
        mvmModule.mainViewModel.set("padding", [30, 60, 40, 40]);
        return wait(3000);
    }).then(function () {
        polygon.addPoint(mapsModule.Position.positionFromLatLng(-34.22, 151.20));
        console.log("Adding point to Polygon...", polygon);
        return wait(3000);
    }).then(function () {
        console.log(`Making marker visible`);
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 2;
        });
        marker.visible = true;
        return wait(3000);
    }).then(function () {
        console.log(`Changing the marker's anchor (anchor point?) and opacity`);
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 2;
        });
        // marker.position = mapsModule.Position.positionFromLatLng(-32.89,151.44);
        marker.anchor = [1, 1];
        marker.alpha = 0.8;
        return wait(3000);
    }).then(function () {
        console.log("Changing to dark mode...");
        mapView.setStyle(style);
        return wait(3000);
    }).then(function () {
        console.log("And now since Rick hates it, changing to light mode...");
        console.log(`(Too hard.  I just changed all the #2n2n2n's to #ananan's)`);
        mapView.setStyle(style2);
        return wait(3000);
    }).then(function () {
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 1;
        });
        console.log("Removing marker...", marker.userData);
        mapView.removeMarker(marker);
        return wait(3000);
    }).then(function () {
        console.log("Removing all circles...");
        mapView.removeAllCircles();
        console.log("Removing all polylines...");
        mapView.removeAllPolylines();
        console.log("Removing all polygons...");
        mapView.removeAllPolygons();
      return wait(3000);
    }).then(function () {
        console.log("Hiding compass...");
        mapView.settings.compassEnabled = false;
        printUISettings(mapView.settings);
      return wait(3000);
    }).then(function () {
        console.log("Changing bounds...");
        var bounds = mapsModule.Bounds.fromCoordinates(
            mapsModule.Position.positionFromLatLng(-33.88, 151.16),
            mapsModule.Position.positionFromLatLng(-33.78, 151.24)
        );
        mapView.setViewport(bounds);
        return wait(3000);
    }).then(function () {
        var marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(mapView.latitude, mapView.longitude);
        marker.title = "All Done";
        marker.snippet = "Enjoy!";
        marker.color = 240;
        mapView.addMarker(marker);
        marker.showInfoWindow();
    }).catch(function (error) {
        console.log(error);
    });
    console.log(`Came off the end of the then's.  Now many promises pending.`);
}

function onCoordinateTapped(args) {
    console.log("Coordinate Tapped, Lat: " + args.position.latitude + ", Lon: " + args.position.longitude, args);
}

function onMarkerEvent(args) {
   console.log("Marker Event: '" + args.eventName
                + "' triggered on: " + args.marker.title
                + ", Lat: " + args.marker.position.latitude + ", Lon: " + args.marker.position.longitude, args);
}

var lastCamera = null;
function onCameraChanged(args) {
    console.log("Camera changed: "+JSON.stringify(args.camera), JSON.stringify(args.camera) === lastCamera);
    lastCamera = JSON.stringify(args.camera);
    var bounds = mapView.projection.visibleRegion.bounds;
    console.log("Current bounds: " + JSON.stringify({
          southwest: [bounds.southwest.latitude, bounds.southwest.longitude],
          northeast: [bounds.northeast.latitude, bounds.northeast.longitude]
        }));
}

exports.onMapReady = onMapReady;
exports.onCoordinateTapped = onCoordinateTapped;
exports.onMarkerEvent = onMarkerEvent;
exports.onCameraChanged = onCameraChanged;
exports.onNavigatingTo = onNavigatingTo;