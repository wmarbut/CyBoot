var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var fs = IMPORTS.require('fs');

var LogWriteAssistant = function() {
}

LogWriteAssistant.prototype.run(future) {
	var error_data = this.controller.args.error_data;
	if (!error_data) {
		future.result = {"error": true, "description":"no error data found to log"};
		return
	}
	var file_name = this.getTimestamp() + "_SubOrbital_Error_Log.txt";
	
	/* Make sure SubOrbital direcory exists */
	if (!this.verifyDirectory) {
		console.log("Creating SubOrbital directory");
		this.createDirectory();
	}
	
	/* Write the log */
	fs.writeFile(('/media/internal/'+file_name), error_data, encoding='utf8', function(err) {
		if (err) {
			console.log("Error occurred writing the error log!");
		} else {
			console.log("File Saved");
		}	
	});
}
LogWriteAssistant.prototype.verifyDirectory() {
	var dir_exists = false;
	var dir_contents = fs.readdirSync('/media/internal');
	if (dir_contents && dir_contents.length > 0) {
		for (var dir_i in dir_contents) {
			if (dir_contents[dir_i] == "SubOrbital") {
				dir_exists = true;
			}
		}
	}
	return dir_exists;
}
LogWriteAssistant.prototype.createDirectory() {
	fs.mkdirSync('/media/internal/SubOrbital', 777);
}

LogWriteAssistant.prototype.getTimestamp = function() {
	var date = new Date();
	var date_string = "";
	var meridian = "am";
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	if (hours > 12) {
		hours -= 12;
		meridian = "pm";
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	
	return month + "-" + day + "-" + hours + "-" + minutes + "-" + meridian;
}