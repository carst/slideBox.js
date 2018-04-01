// jshint ignore:start
var getScriptDir = (function() {

	var scripts = document.getElementsByTagName('script'),
	scriptPath = scripts[scripts.length-1].src.split('?')[0], // remove any ?query
	scriptDir = scriptPath.split('/').slice(0, -1).join('/')+'/'; // remove last filename part of path

	return function() { return scriptDir; };
})();