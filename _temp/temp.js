var coords = [
    new window.google.maps.LatLng(25.774252, 30.309147),
    new window.google.maps.LatLng(59.94496901109341, 30.305989980697635),
	new window.google.maps.LatLng(59.95252709507345, 30.334764719009403)
];
var areaPoly = new google.maps.Polygon({
	paths: coords
});

var pointsInArea = [];

function drawMarker(latLng) {
	var marker = new window.google.maps.Marker({
		position: latLng,
		map: map
	});
}

for (var key in window.portals) {
	var portal = window.portals[key];
	if (!!portal) {
		var latLng = new window.google.maps.LatLng(portal._latlng.lat, portal._latlng.lng);
		if (window.google.maps.geometry.poly.containsLocation(latLng, areaPoly)) {
			pointsInArea.push(latLng);
			drawMarker(latLng);
		}
	}
}

//http://maps.google.com/mapfiles/ms/micons/pink-dot.png


function drawMarker(layer, portal) {
	var icon = new L.icon({
		iconUrl: "http://maps.google.com/mapfiles/ms/micons/pink-dot.png",
		shadowUrl: null,
		iconSize: [32, 32], // size of the icon
		iconAnchor: [32, 32], // point of the icon which will correspond to marker's location
		popupAnchor: [0, -35], // point from which the popup should open relative to the iconAnchor
	});

	L.marker([portal.lat, portal.lng], { icon: icon, guid: portal.id }).addTo(layer);
}