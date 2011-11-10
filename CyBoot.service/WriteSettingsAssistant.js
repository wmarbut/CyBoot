var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var Future    = libraries["foundations"].Control.Future;
var PalmCall  = libraries["foundations"].Comms.PalmCall;
var exec = IMPORTS.require("child_process").exec;

var WriteSettingsAssistant = function() {
}
WriteSettingsAssistant.prototype.run = function(future) {
	console.log("***WriteSettingsAssistant invoked");
	var commands = "";
	var boot_data = this.controller.args.boot_data;
	var valid_text_regex = /^[a-zA-Z0-9\-\_]*$/;
	var valid_number_regex = /^[0-9]*$/;
	if (boot_data && boot_data.defaultBoot) {
		
		var defaultBootMatch = boot_data.defaultBoot.match(valid_text_regex);
		if (!defaultBootMatch) {
			boot_data.defaultBoot = "webOS";
		}
		if (boot_data.nextBoot) {
			var nextBootMatch = boot_data.nextBoot.match(valid_text_regex);
			if (!nextBootMatch) {
				console.log("Invalid nextBoot data: '" + boot_data.nextBoot + "'");
				boot_data.nextBoot = "";
			}
		}
		if (boot_data.timeout) {
			var timeoutMatch = boot_data.timeout.match(valid_number_regex);
			if (!timeoutMatch) {
				console.log("Invalid timeout data: '" + boot_data.timeout + "'");
				boot_data.timeout = "";
			}
		}
		
		console.log("Boot data found in args");
		commands += "echo '" + boot_data.defaultBoot + "' > /boot/moboot.default;";
		boot_data.nextBoot = (boot_data.nextBoot)? boot_data.nextBoot : "";
		commands += "echo '" + boot_data.nextBoot + "' > /boot/moboot.next;";
		boot_data.timeout = (boot_data.timeout)? boot_data.timeout : "";
		commands += "echo '" + boot_data.timeout + "' > /boot/moboot.timeout;";
	}
	if (commands.length > 0) {
		commands = "mount -o remount,rw /boot;" + commands + "mount -o remount,ro /boot;";
		console.log("command constructed: " + commands);
		exec(commands,
			function(error, stdout, stderr) {
				if (error) 
					console.log("Error: " + error);
				if (stderr)
					console.log("Stderr: " + stderr);
				read_future = PalmCall.call("palm://com.whitm.cyboot.service", "readSettings", {"save":true});
				read_future.then(function(f) {
					var read_result = f.result;
					read_result.restart = true;
					f.result = read_result;
				});
				future.nest(read_future);
			}
		);
	} else {
		console.log("No data found to write command from");
		future.result = {"error":true};
	}
}