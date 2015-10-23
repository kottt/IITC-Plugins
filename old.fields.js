// ==UserScript==
// @id             iitc-plugin-optimal-fields@kottt
// @name           IITC plugin: OptimalFields
// @category       Layer
// @version        0.100
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL
// @downloadURL
// @description    allow to select portals area and calculate optimal fields
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
	// ensure plugin framework is there, even if iitc is not yet loaded
	if (typeof window.plugin !== 'function') window.plugin = function () { };



	// PLUGIN START ///////////////////////////////////////////////////////

	// use own namespace for plugin
	window.plugin.OptimalFields = function () { };
	window.plugin.OptimalFields.zapLayers = {};
	window.plugin.OptimalFields.MIN_MAP_ZOOM = 13;

	var drawnGuids = {};

	var _gmaps;


	var _lib = (function () {
		function pe(a) { return a / (Math.PI / 180); }
		function oe(a) { return Math.PI / 180 * a; }
		function tf(a) { return oe(a.k); }
		function uf(a) { return oe(a.D); }
		function me(a, b, c) {
			c = c - b;
			return ((a - b) % c + c) % c + b;
		}

		function sF(a, b) {
			return Math.abs(me(b - a, -180, 180));
		}

		function tF(a, b, c, d, e) {
			if (!d) {
				c = sF(a.lng(), c) / sF(a.lng(), b.lng());
				if (!e)
					return e = Math.sin(oe(a.lat())), e = Math.log((1 + e) / (1 - e)) / 2, b = Math.sin(oe(b.lat())), b = Math.log((1 + b) / (1 - b)) / 2, pe(2 * Math.atan(Math.exp(e + c * (b - e))) - Math.PI / 2);
				a = e.fromLatLngToPoint(a);
				b = e.fromLatLngToPoint(b);
				return e.fromPointToLatLng(new U(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y))).lat();
			}
			e = oe(a.lat());
			a = oe(a.lng());
			d = oe(b.lat());
			b = oe(b.lng());
			c = oe(c);
			return me(pe(Math.atan2(Math.sin(e) * Math.cos(d) * Math.sin(c - b) - Math.sin(d) * Math.cos(e) * Math.sin(c - a), Math.cos(e) * Math.cos(d) * Math.sin(a - b))), -90, 90);
		}
		var lib = {
			containsLocation: function (a, b) {
				for (var c = me(a.lng(), -180, 180), d = !!b.get("geodesic"), e = b.get("latLngs"), f = b.get("map"), f = !d && f ? f.getProjection() : null, g = false, h = 0, n = e.getLength() ; h < n; ++h)
					for (var r = e.getAt(h), t = 0, x = r.getLength() ; t < x; ++t) {
						var y = r.getAt(t),
							z = r.getAt((t + 1) % x),
							I = me(y.lng(), -180, 180),
							F = me(z.lng(), -180, 180),
							M = Math.max(I, F),
							I = Math.min(I, F);
						(180 < M - I ? c >= M || c < I : c < M && c >= I) && tF(y, z, c, d, f) < a.lat() && (g = !g);
					}
				return g || lib.isLocationOnEdge(a, b);
			},
			isLocationOnEdge: function (a, b, c) {
				c = c || 1E-9;
				var d = me(a.lng(), -180, 180),
					e = b instanceof $h, f = !!b.get("geodesic"), g = b.get("latLngs");
				b = b.get("map");
				b = !f && b ? b.getProjection() : null;
				for (var h = 0, n = g.getLength() ; h < n; ++h)
					for (var r = g.getAt(h), t = r.getLength(), x = e ? t : t - 1, y = 0; y < x; ++y) {
						var z = r.getAt(y),
							I = r.getAt((y + 1) % t),
							F = me(z.lng(), -180, 180),
							M = me(I.lng(), -180, 180),
							V = Math.max(F, M),
							P = Math.min(F, M);
						if (F = 1E-9 >= Math.abs(me(F - M, -180, 180)) && (Math.abs(me(F - d, -180, 180)) <= c || Math.abs(me(M - d, -180, 180)) <= c)) var F = a.lat(),
							M = Math.min(z.lat(), I.lat()) - c,
							L = Math.max(z.lat(), I.lat()) + c,
							F = F >= M && F <= L;
						if (F) return !0;
						if (180 < V - P ? d + c >= V || d - c <= P : d + c >= P && d - c <= V)
							if (z = tF(z, I, d, f, b), Math.abs(z - a.lat()) < c) return !0;
					}
				return !1;
			},
			computeHeading: function (a, b) {
				var c = tf(a),
					d = tf(b),
					e = uf(b) - uf(a);
				return me(pe(Math.atan2(Math.sin(e) * Math.cos(d), Math.cos(c) * Math.sin(d) - Math.sin(c) * Math.cos(d) * Math.cos(e))), -180, 180);
			},
		};

		return lib;
	})();


	function drawMarker(point, id) {
		var icon = new L.icon({
			iconUrl: "http://maps.google.com/mapfiles/ms/micons/pink-dot.png",
			shadowUrl: null,
			iconSize: [32, 32], // size of the icon
			iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
			popupAnchor: [0, -35], // point from which the popup should open relative to the iconAnchor
		});

		L.marker([point.lat, point.lng], { icon: icon, guid: id }).addTo(window.plugin.OptimalFields.CircleHolderGroup);
	}

	function toLatLng(latlng) {
		return new _gmaps.LatLng(latlng.lat, latlng.lng);
	}

	function getValidPortals(polylineCoords) {
		var coords = [];
		for (var i = 0; i < polylineCoords.length; i++) {
			var point = polylineCoords[i];
			coords.push(toLatLng(point));
		}
		var areaPoly = new _gmaps.Polygon({ paths: coords });

		var portalsInArea = [];

		for (var key in _portalsCache) {
			var portal = _portalsCache[key];
			if (!!portal) {
				var latLng = toLatLng(portal._latlng);
				if (_lib.containsLocation(latLng, areaPoly)) {
					portalsInArea.push(key);
				}
			}
		}

		return portalsInArea;
	}
    
    window.plugin.OptimalFields.getPortalsInPolygon = function(polylineCoords) {
		var coords = [];
		for (var i = 0; i < polylineCoords.length; i++) {
			var point = polylineCoords[i];
			coords.push(toLatLng(point));
		}
		var areaPoly = new _gmaps.Polygon({ paths: coords });

		var portalsInArea = [];

		for (var key in _portalsCache) {
			var portal = _portalsCache[key];
			if (!!portal) {
				var latLng = toLatLng(portal._latlng);
				if (_lib.containsLocation(latLng, areaPoly)) {
					portalsInArea.push(portal._latlng);
				}
			}
		}

		return JSON.stringify(portalsInArea);
	}

	function getDifference(a1, a2) {
		a1 = (a1 > 0) ? a1 : 360 + a1;
		a2 = (a2 > 0) ? a2 : 360 + a2;
		var angle = Math.abs(a1 - a2) + 180;
		if (angle > 180) {
			angle = 360 - angle;
		}
		return Math.abs(angle);
	}

	function getPointAngle(a, b, bc) {
		var ab = _lib.computeHeading(a, b);
		return getDifference(ab, bc);
	}

	function getAngle(a, b, c) {
		var ab = _lib.computeHeading(a, b);
		var bc = _lib.computeHeading(b, c);
		return getDifference(ab, bc);
	}

	function isCorrectDirection(p1, p2, pX) {
		var angleAbc = getAngle(pX, p1, p2);
		var angleAcb = getAngle(pX, p2, p1);
		return (angleAbc + angleAcb) < 180;
	}

	function LCS(a, b) {
		var m = a.length, n = b.length,
			C = [], i, j;
		for (i = 0; i <= m; i++) C.push([0]);
		for (j = 0; j < n; j++) C[0].push(0);
		for (i = 0; i < m; i++)
			for (j = 0; j < n; j++)
				C[i + 1][j + 1] = a[i] === b[j] ? C[i][j] + 1 : Math.max(C[i + 1][j], C[i][j + 1]);

		function concat(arr1, arr2) {
			return arr1.concat(arr2);
		}

		return (function bt(i, j) {
			if (i * j === 0) {
				 return [];
			}
			if (a[i - 1] === b[j - 1]) {
				return concat(bt(i - 1, j - 1), a[i - 1]);
			}
			return (C[i][j - 1] > C[i - 1][j]) ? bt(i, j - 1) : bt(i - 1, j);
		}(m, n));
	}

	var _portalsCache = {};

	window.plugin.OptimalFields.portalAdded = function (data) {
		data.portal.on('add', function () {
			_portalsCache[this.options.guid] = window.portals[this.options.guid];
		});
	}

	function generateDtLine(p1, p2, color) {
		return {
			type: "polyline",
			latLngs: [p1, p2],
			color: color
		};
	}

	window.plugin.OptimalFields.checkPortals = function (polylineCoords, p1, p2, color1, color2, debug) {
		if (!!debug) { throw "debug"; }
		var portalsInArea = getValidPortals(polylineCoords);
		if (portalsInArea.length === 0) {
			return;
		}

		var a = toLatLng(p1), b = toLatLng(p2);
		if (isCorrectDirection(a, b, toLatLng(_portalsCache[portalsInArea[0]]._latlng))) {
			a = toLatLng(p1), b = toLatLng(p2);
		} else {
			a = toLatLng(p2), b = toLatLng(p1);
		}

		var ab = _lib.computeHeading(a, b);
		var ba = _lib.computeHeading(b, a);

		var aAngles = [];
		var bAngles = [];

		for (var i = 0; i < portalsInArea.length; i++) {
			var portal = _portalsCache[portalsInArea[i]];
			var latlng = toLatLng(portal._latlng);

			var angleLeft = getPointAngle(latlng, a, ab);
			var angleRight = getPointAngle(latlng, b, ba);

			aAngles.push({
				angle: angleLeft,
				latlng: portal._latlng,
				id: portalsInArea[i]
			});
			bAngles.push({
				angle: angleRight,
				latlng: portal._latlng,
				id: portalsInArea[i]
			});
		}

		function comapreAngles(x, y) {
			return x.angle - y.angle;
		}

		aAngles.sort(comapreAngles);
		bAngles.sort(comapreAngles);

		var arrA = [], arrB = [];

		for (var i = 0; i < portalsInArea.length; i++) {
			arrA.push(aAngles[i].id);
			arrB.push(bAngles[i].id);
		}

		var portalIds = LCS(arrA, arrB);

		var drawnItems = [];

		for (var i = 0; i < portalIds.length; i++) {
			var portal = _portalsCache[portalIds[i]];
			drawMarker(portal._latlng, portalIds[i]);

			drawnItems.push(generateDtLine(p1, portal._latlng, color1));
			drawnItems.push(generateDtLine(p2, portal._latlng, color2));
		}

		return drawnItems;
	}


	var setup = function () {
		_gmaps = window.google.maps;

		// this layer is added to the layer chooser, to be toggled on/off
		window.plugin.OptimalFields.LayerHolderGroup = new L.LayerGroup();

		// this layer is added into the above layer, and removed from it when we zoom out too far
		window.plugin.OptimalFields.CircleHolderGroup = new L.LayerGroup();

		window.plugin.OptimalFields.LayerHolderGroup.addLayer(window.plugin.OptimalFields.CircleHolderGroup);
		window.addLayerGroup('OptimalFields', window.plugin.OptimalFields.LayerHolderGroup, true);

		window.addHook('portalAdded', window.plugin.OptimalFields.portalAdded);
	}

	// PLUGIN END //////////////////////////////////////////////////////////


	setup.info = plugin_info; //add the script info data to the function as a property
	if (!window.bootPlugins) window.bootPlugins = [];
	window.bootPlugins.push(setup);
	// if IITC has already booted, immediately run the 'setup' function
	if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);