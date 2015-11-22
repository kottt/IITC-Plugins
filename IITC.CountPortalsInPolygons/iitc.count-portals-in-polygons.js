// ==UserScript==
// @id             iitc-plugin-count-portals-in-polygons@kottt
// @name           IITC plugin: CountPortalsInPolygons
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


(function() {

	function wrapper(pluginInfo) {

		var getShortGmapsLib = function () {
			function pe(a) { return a / (Math.PI / 180); }
			function oe(a) { return Math.PI / 180 * a; }
			function tf(a) { return oe(a.lat()); }
			function uf(a) { return oe(a.lng()); }
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
					var c = me(a.lng(), -180, 180),
					    d = !!b.get("geodesic"),
					    e = b.get("latLngs"),
					    f = b.get("map"),
					    g = false,
					    n = e.getLength();
					f = !d && f ? f.getProjection() : null;

					for (var h = 0; h < n; ++h)
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
				}
			};

			return lib;
		};


		// ensure plugin framework is there, even if iitc is not yet loaded
		if (typeof window.plugin !== "function") window.plugin = function() {};


// PLUGIN START ///////////////////////////////////////////////////////

		// use own namespace for plugin
		window.plugin.CountPortalsInPolygons = function () { };

		// ReSharper disable once InconsistentNaming
		var __gmaps;
		// ReSharper disable once InconsistentNaming
		var __lib;
		// ReSharper disable once InconsistentNaming
		var __portalsCache = {};


		function toLatLng(latlng) {
			return new __gmaps.LatLng(latlng.lat, latlng.lng);
		}

		function isPortalInArea(portal, areaPoly) {
			if (!!portal) {
				var latLng = toLatLng(portal._latlng);
				if (__lib.containsLocation(latLng, areaPoly)) {
					return true;
				}
			}
			return false;
		}

		function getValidPortals(polylineCoords) {
			var areaPoly = new __gmaps.Polygon({ paths: polylineCoords.map(toLatLng) });

			var portalsInArea = [];

			for (var key in __portalsCache) {
				if (__portalsCache.hasOwnProperty(key)) {
					if (isPortalInArea(__portalsCache[key], areaPoly)) {
						portalsInArea.push(key);
					}
				}
			}

			return portalsInArea;
		}


		function drawMarker(point, id) {
			var icon = new L.icon({
				iconUrl: "http://maps.google.com/mapfiles/ms/micons/pink-dot.png",
				shadowUrl: null,
				iconSize: [32, 32], // size of the icon
				iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
				popupAnchor: [0, -35], // point from which the popup should open relative to the iconAnchor
			});

			L.marker([point.lat, point.lng], { icon: icon, guid: id }).addTo(window.plugin.CountPortalsInPolygons.PortalHolderGroup);
		}

		window.plugin.CountPortalsInPolygons.getPortals = function (drawTools) {
			var totalCount = 0;
			drawTools.forEach(function (item) {
				if (item.type === "polyline") {
					var portals = getValidPortals(item.latLngs);
					
					portals.forEach(function (id) {
						drawMarker(__portalsCache[id]._latlng, id);
					});

					totalCount += portals.length;
				}
			});

			console.log("Portals inside your polygons: " + totalCount);

			return totalCount;
		};

		var setup = function() {
			__gmaps = window.google.maps;
			__lib = getShortGmapsLib();


			// this layer is added to the layer chooser, to be toggled on/off
			window.plugin.CountPortalsInPolygons.LayerHolderGroup = new L.LayerGroup();

			// this layer is added into the above layer, and removed from it when we zoom out too far
			window.plugin.CountPortalsInPolygons.PortalHolderGroup = new L.LayerGroup();

			window.plugin.CountPortalsInPolygons.LayerHolderGroup.addLayer(window.plugin.CountPortalsInPolygons.PortalHolderGroup);
			window.addLayerGroup("CountPortalsInPolygons", window.plugin.CountPortalsInPolygons.LayerHolderGroup, true);


			window.addHook("portalAdded", function (data) {
				data.portal.on("add", function () {
					__portalsCache[this.options.guid] = window.portals[this.options.guid];
				});
			});
		}

		// PLUGIN END //////////////////////////////////////////////////////////


		setup.info = pluginInfo; //add the script info data to the function as a property
		if (!window.bootPlugins) window.bootPlugins = [];
		window.bootPlugins.push(setup);
		// if IITC has already booted, immediately run the 'setup' function
		if (window.iitcLoaded) setup();
	}

	// inject code into site context
	var script = document.createElement("script");
	var info = {};
	var gmInfo = window.GM_info;
	if (typeof gmInfo !== "undefined" && gmInfo && gmInfo.script) info.script = { version: gmInfo.script.version, name: gmInfo.script.name, description: gmInfo.script.description };
	script.appendChild(document.createTextNode("(" + wrapper + ")(" + JSON.stringify(info) + ");"));
	(document.body || document.head || document.documentElement).appendChild(script);
})();