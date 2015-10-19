// ==UserScript==
// @id             iitc-plugin-e7Radius@zaso
// @name           IITC plugin: E7Radius
// @category       Layer
// @version        0.100
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      
// @downloadURL    
// @description    show 100m circle to enl portal
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
	// ensure plugin framework is there, even if iitc is not yet loaded
	if (typeof window.plugin !== 'function') window.plugin = function () { };

	//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
	//(leaving them in place might break the 'About IITC' page or break update checks)
	plugin_info.buildName = 'ebragim';
	plugin_info.dateTimeVersion = '100';
	plugin_info.pluginId = 'E7Radius';
	//END PLUGIN AUTHORS NOTE



	// PLUGIN START ///////////////////////////////////////////////////////

	// use own namespace for plugin
	window.plugin.E7Radius = function () { };
	window.plugin.E7Radius.zapLayers = {};
	window.plugin.E7Radius.MIN_MAP_ZOOM = 13;

	window.plugin.E7Radius.portalAdded = function (data) {
		data.portal.on('add', function () {
			window.plugin.E7Radius.draw(this.options.guid, this.options.team);
		});

		data.portal.on('remove', function () {
			window.plugin.E7Radius.remove(this.options.guid, this.options.team);
		});
	}

	window.plugin.E7Radius.remove = function (guid, faction) {
		var previousLayer = window.plugin.E7Radius.zapLayers[guid];
		if (previousLayer) {
			if (faction === TEAM_ENL) {
				window.plugin.E7Radius.zapCircleEnlHolderGroup.removeLayer(previousLayer);
			} else {
				window.plugin.E7Radius.zapCircleResHolderGroup.removeLayer(previousLayer);
			}
			delete window.plugin.E7Radius.zapLayers[guid];
		}
	}

	window.plugin.E7Radius.draw = function (guid, faction) {
		var d = window.portals[guid];

		if (faction !== TEAM_NONE) {
			var coo = d._latlng;
			var latlng = new L.LatLng(coo.lat, coo.lng);
			var optCircleRes = { color: 'black', opacity: 0.9, fillColor: 'blue', fillOpacity: 0, weight: 1, clickable: false, dashArray: [10, 6] };
			var optCircleEnl = { color: 'red', opacity: 1, fillColor: 'red', fillOpacity: 0, weight: 1, clickable: false, dashArray: [10, 0] };
			var range = 100;

			var circleRes = new L.Circle(latlng, range, optCircleRes);
			var circleEnl = new L.Circle(latlng, range, optCircleEnl);

			if (faction === TEAM_ENL) {
				circleEnl.addTo(window.plugin.E7Radius.zapCircleEnlHolderGroup);
			} else {
				circleRes.addTo(window.plugin.E7Radius.zapCircleResHolderGroup);
			}
			window.plugin.E7Radius.zapLayers[guid] = circleRes + circleEnl;
		}
	}

	window.plugin.E7Radius.showOrHide = function () {
		if (map.getZoom() >= window.plugin.E7Radius.MIN_MAP_ZOOM) {
			// show the layer
			if (!window.plugin.E7Radius.zapLayerEnlHolderGroup.hasLayer(window.plugin.E7Radius.zapCircleEnlHolderGroup)) {
				window.plugin.E7Radius.zapLayerEnlHolderGroup.addLayer(window.plugin.E7Radius.zapCircleEnlHolderGroup);
				$('.leaflet-control-layers-list span:contains("E7Radius Enlightened")').parent('label').removeClass('disabled').attr('title', '');
			}
			if (!window.plugin.E7Radius.zapLayerResHolderGroup.hasLayer(window.plugin.E7Radius.zapCircleResHolderGroup)) {
				window.plugin.E7Radius.zapLayerResHolderGroup.addLayer(window.plugin.E7Radius.zapCircleResHolderGroup);
				$('.leaflet-control-layers-list span:contains("E7Radius Resistance")').parent('label').removeClass('disabled').attr('title', '');
			}
		} else {
			// hide the layer
			if (window.plugin.E7Radius.zapLayerEnlHolderGroup.hasLayer(window.plugin.E7Radius.zapCircleEnlHolderGroup)) {
				window.plugin.E7Radius.zapLayerEnlHolderGroup.removeLayer(window.plugin.E7Radius.zapCircleEnlHolderGroup);
				$('.leaflet-control-layers-list span:contains("E7Radius Enlightened")').parent('label').addClass('disabled').attr('title', 'Zoom in to show those.');
			}
			if (window.plugin.E7Radius.zapLayerResHolderGroup.hasLayer(window.plugin.E7Radius.zapCircleResHolderGroup)) {
				window.plugin.E7Radius.zapLayerResHolderGroup.removeLayer(window.plugin.E7Radius.zapCircleResHolderGroup);
				$('.leaflet-control-layers-list span:contains("E7Radius Resistance")').parent('label').addClass('disabled').attr('title', 'Zoom in to show those.');
			}
		}
	}

	var setup = function () {
		// this layer is added to the layer chooser, to be toggled on/off
		window.plugin.E7Radius.zapLayerEnlHolderGroup = new L.LayerGroup();
		window.plugin.E7Radius.zapLayerResHolderGroup = new L.LayerGroup();

		// this layer is added into the above layer, and removed from it when we zoom out too far
		window.plugin.E7Radius.zapCircleEnlHolderGroup = new L.LayerGroup();
		window.plugin.E7Radius.zapCircleResHolderGroup = new L.LayerGroup();

		window.plugin.E7Radius.zapLayerEnlHolderGroup.addLayer(window.plugin.E7Radius.zapCircleEnlHolderGroup);
		window.plugin.E7Radius.zapLayerResHolderGroup.addLayer(window.plugin.E7Radius.zapCircleResHolderGroup);

		// to avoid any favouritism, we'll put the player's own faction layer first
		if (PLAYER.team == 'RESISTANCE') {
			window.addLayerGroup('E7Radius Resistance', window.plugin.E7Radius.zapLayerResHolderGroup, true);
			window.addLayerGroup('E7Radius Enlightened', window.plugin.E7Radius.zapLayerEnlHolderGroup, true);
		} else {
			window.addLayerGroup('E7Radius Enlightened', window.plugin.E7Radius.zapLayerEnlHolderGroup, true);
			window.addLayerGroup('E7Radius Resistance', window.plugin.E7Radius.zapLayerResHolderGroup, true);
		}

		window.addHook('portalAdded', window.plugin.E7Radius.portalAdded);

		map.on('zoomend', window.plugin.E7Radius.showOrHide);

		window.plugin.E7Radius.showOrHide();
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

