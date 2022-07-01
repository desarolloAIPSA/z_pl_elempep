/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"aip/z_pl_elempep/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
