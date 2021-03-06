// ==UserScript==
// @id             iitc-plugin-nerthus@dragonsangel
// @name           IITC Plugin: Nerthus Portal Grabber
// @category       Misc
// @version        0.0.0.9
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://raw.githubusercontent.com/Dragonsangel/NerthusScripts/master/NerthusPortalGrabber.meta.js
// @downloadURL    https://raw.githubusercontent.com/Dragonsangel/NerthusScripts/master/NerthusPortalGrabber.user.js
// @description    Nerthus helper script
// @include        https://ingress.com/intel/*
// @include        http://ingress.com/intel/*
// @include        https://*.ingress.com/intel/*
// @include        http://*.ingress.com/intel/*
// @include        https://intel.ingress.com/*
// @include        http://intel.ingress.com/*
// @match          https://ingress.com/intel/*
// @match          http://ingress.com/intel/*
// @match          https://*.ingress.com/intel/*
// @match          http://*.ingress.com/intel/*
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
    plugin_info.buildName = 'local';
    plugin_info.dateTimeVersion = '0.0.0.9';
    plugin_info.pluginId = 'nerthus';
//END PLUGIN AUTHORS NOTE

// PLUGIN START ////////////////////////////////////////////////////////

  window.plugin.nerthus = function() {};
  const nerthus = window.plugin;
  nerthus.version = '0.0.0.9 Beta';

  nerthus.setup = function() {
    window.addHook('mapDataRefreshEnd', nerthus.postPortalDetails);
    window.addHook('portalSelected', nerthus.onPortalSelected);
  };


  ///////////////////////////////////////////////////////////
  // API CALL
  nerthus.postPortalDetails = function(resource, data) {
    var foundPortals = new Array();
    var displayBounds = map.getBounds();
    $.each(window.portals, function(i, portal) {
        if(!displayBounds.contains(portal.getLatLng())) {
          return true;
        }

        var guid = portal.options.guid;
        var d = portal.options.data;
        var name = d.title;
        if (name) {name.replace(/\s+/g, " "); } else { console.log(portal.options); return;}
        var lat = d.latE6/1E6;
        var lng = d.lngE6/1E6;
        var imageUrl = d.image;

        var thisPortal = {'id':guid,'title':name,'lat':lat,'lng':lng,'image':imageUrl};
        foundPortals.push(thisPortal);
    });

    if (foundPortals.length > 0) {
      while (foundPortals.length) {
        $.ajax({
          type: "POST",
          url: 'https://nerthusbot.de/Utilities/SubmitPortal',
          contentType: "application/json",
          crossDomain: true,
          data: JSON.stringify(foundPortals.splice(0,1000)),
          success: function(data, textStatus, jqXHR) {
            console.log("Nerthus got the data");
          }
        });
      }
    }
  };

  nerthus.onPortalSelected = function () {
    const portalDetails = document.getElementById('portaldetails');

		if (window.selectedPortal == null) {
			return;
		}

		if (!nerthus.onPortalSelectedPending) {
			nerthus.onPortalSelectedPending = true;

			setTimeout(function () {
				nerthus.onPortalSelectedPending = false;
        $(portalDetails).append('<div style="color:cyan"> Portal ID: ' + window.selectedPortal + '</div>');
			}, 0);
		}
  }
  var setup = nerthus.setup;

  // PLUGIN END //////////////////////////////////////////////////////////

  setup.info = plugin_info; //add the script info data to the function as a property
  if (!window.bootPlugins) { window.bootPlugins = []; }

  window.bootPlugins.push(setup);

  // if IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
