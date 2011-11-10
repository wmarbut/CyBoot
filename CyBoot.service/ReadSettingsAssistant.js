var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var Future    = libraries["foundations"].Control.Future;
var PalmCall  = libraries["foundations"].Comms.PalmCall;
var exec = IMPORTS.require("child_process").exec;

var ReadSettingsAssistant = function() {
}
ReadSettingsAssistant.prototype.run = function(future) {
	var save = (this.controller.args.save)? true : false;
	exec('NEXTBOOT=`cat /boot/moboot.next`; DEFAULTBOOT=""; if [ -e /boot/moboot.default ]; then DEFAULTBOOT=`cat /boot/moboot.default`; fi; TIMEOUT=""; if [ -e /boot/moboot.timeout ]; then TIMEOUT=`cat /boot/moboot.timeout`; fi; echo "{\\"defaultBoot\\":\\"$DEFAULTBOOT\\",\\"nextBoot\\":\\"$NEXTBOOT\\",\\"timeout\\":\\"$TIMEOUT\\"}"', 
		function(error,stdout,stderr){
			var return_val = false;
			try {
				console.log("Stdout from service is below");
				console.log(stdout);
				return_val = JSON.parse(trim(stdout));
				return_val.save = save;
			} catch (exception) {
				console.log("JSON parse exception occurred");
				console.log("Invalid JSON:\n" + stdout);
				return_val = {"error":true};
			}
			future.result = return_val;
		}
	);
}

function trim(str, chars) {
	return ltrim(rtrim(str, chars), chars);
}
 
function ltrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
function rtrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}	