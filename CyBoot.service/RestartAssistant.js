var PalmCall  = libraries["foundations"].Comms.PalmCall;
var RestartAssistant = function() {
}
RestartAssistant.prototype.run = function(future) {
	console.log("Restart assistant called");
	exec('luna-send -n 1 palm://com.palm.power/shutdown/machineReboot \'{"reason":"Reboot requested from CyBoot"}\'', function(error, stdout, stderr) {
		if (error)
			console.log("Restart Error: " +error);
		if (stdout)
			console.log("Restart Stdout: " + stdout);
		if (stderr)
			console.log("Restart Stderr: " + stderr);
	});
}