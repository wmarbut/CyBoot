enyo.kind({
	name: "CyBootMain",
	kind: enyo.Pane,
	ready: function() {
		this.callReadSettings()
	},
	components: [
		{
			kind: "VFlexBox",
			flex: 1,
			components: [
			{
				kind: "PageHeader",
				content: "CyBoot - RC1"
			},
			{
				kind: "HFlexBox",
				pack: "center",
				style: "text-align: center",
				content: "<br/>Choose your next boot OS and your default boot for the moboot bootloader. Written by @grep_awesome",
			},
			{
				kind: "VFlexBox",
				flex: 1,
				components: [
					{
						kind: "RowGroup",
						defaultKind: "HFlexBox",
						caption: "Boot Default",
						components: [
							{
								components: [
									{
										kind: "ListSelector",
										content: " ",
										flex: 1,
										name: "default_field",
										items: [
											{
												caption: "WebOS"
											},
											{
												caption: "Android"
											}
										]
										
									}
								]
							}
						]//rowgroup components
					},
					{
						kind: "RowGroup",
						defaultKind: "HFlexBox",
						caption: "Next Boot",
						components: [
							{
								components: [
									{
										kind: "ListSelector",
										content: " ",
										flex: 1,
										name: "next_field",
										items: [
											{
												caption: "WebOS"
											},
											{
												caption: "Android"
											},
											{
												caption: "None - Choose at boot"
											}
										]
									}
								]
							}
						]//rowgroup components
					},
					{
						kind: "RowGroup",
						caption: "Bootloader Timeout (how long in seconds before the default OS boots)",
						components: [
							{
									kind: "Input",
									name: "timeout_field",
									onkeypress: "checkNumbersOnly",
									autoKeyModifier: "num-lock",
									hint: "5"
								}
						]
					}
				]//vflexbox componenets
			},
			{
				kind: "Toolbar",
				pack: "center",
				components: [
					{
						caption: "Save", onclick: "doSave"
					},{
						caption: "Reboot", onclick: "confirmRestart"
					}
				]
			},
			{
				name: "readSettings",
				kind: "PalmService",
				service: "palm://com.whitm.cyboot.service",
				method: "readSettings",
				onSuccess: "gotReadSettings",
				onFailure: "serviceFailure"
			},
			{
				name: "writeSettings",
				kind: "PalmService",
				service: "palm://com.whitm.cyboot.service",
				method: "writeSettings",
				onSuccess: "gotReadSettings",
				onFailure: "serviceFailure"
			},
			{
				name: "restart",
				kind: "PalmService",
				service: "palm://com.whitm.cyboot.service",
				method: "restart",
				onSuccess: "restartSuccess",
				onFailure: "serviceFailure"
			},
			{
				kind: "Dialog",
				name: "confirmRestartDialog",
				components: [
					{content: "Do you wish to restart your device?", style: "padding-left: 10px"},
					{layoutKind: "HFlexLayout", pack: "center", components: [
						{kind: "Button", caption: "Restart", popupHandler: true, onclick:"callRestart", className: "enyo-button-negative"},
						{kind: "Button", caption: "Cancel", popupHandler: true}
					]}
				]
			},
			{
				kind: "Dialog",
				name: "saveCompleteDialog",
				components: [
					{
						content: "Settings saved.", style: "padding-left:10px; text-align: center"
					},
					{
						kind: "Button",
						caption: "OK",
						popupHandler: true
					}
				]
			},
			{
				kind: "ModalDialog",
				name: "restartDialog",
				components:[
					{
						style: "padding-left: 10px;font-size:30px;font-weight:bold;text-align:center",
						content: "Device is going down for a restart. Please wait."
					},
					{layoutKind: "HFlexLayout", pack: "center", components: [
						{
							name: "restartSpinner",
							kind: "SpinnerLarge"
						}
					]}
				]
			}
		]},
		{
			kind:  enyo.ModalDialog,
			name: "serviceErrorDialog",
			caption: "An error has occurred. Please restart the application"
		},
		
		
	],//vflexbox components
	gotReadSettings: function(sender, data) {
		console.log("app.js: Settings Data (" + sender + "): " + enyo.json.stringify(data));
		if (data.defaultBoot) {
			if (data.save) {
				this.$.saveCompleteDialog.open();
			}
			console.log("app.js: Default Boot: " + data.defaultBoot);
			data.defaultBoot = (data.defaultBoot == "webOS")? "WebOS" : data.defaultBoot;
			data.defaultBoot = (data.defaultBoot == "CyanogenMod")? "Android" : data.defaultBoot;
			
			this.$.default_field.setValue(data.defaultBoot);
		} else {
			//TODO handle error
			console.err("No default boot found!");
		}
		if (data.nextBoot) {
			console.log("app.js: Next Boot: " + data.nextBoot);
			data.nextBoot = (data.nextBoot == "webOS")? "WebOS" : data.nextBoot;
			data.nextBoot = (data.nextBoot == "CyanogenMod")? "Android" : data.nextBoot;
			this.$.next_field.setValue(data.nextBoot);
		} else {
			this.$.next_field.setValue("None - Choose at boot");
		}
		if (data.timeout) {
			console.log("app.js: Timeout: " + data.timeout);
			this.$.timeout_field.setValue(data.timeout);
		} else {
			this.$.timeout_field.setValue("");
		}
	},
	serviceFailure: function(sender, data) {
		console.log("Service Failure: " + sender + " - data: " + enyo.json.stringify(data));
		this.$.serviceErrorDialog.openAtCenter();
	},
	doSave: function(sender, data) {
		console.log("Save called");
		var defaultBoot = this.$.default_field.getValue();
		defaultBoot = (defaultBoot == "WebOS")? "webOS" : defaultBoot;
		defaultBoot = (defaultBoot == "Android")? "CyanogenMod" : defaultBoot;
		var nextBoot = this.$.next_field.getValue();
		nextBoot = (nextBoot == "WebOS")? "webOS" : nextBoot;
		nextBoot = (nextBoot == "Android")? "CyanogenMod" : nextBoot;
		nextBoot = (nextBoot == "None - Choose at boot")? "" : nextBoot;
		var timeout = this.$.timeout_field.getValue();
		if (window.PalmSystem) {
			this.$.writeSettings.call({"boot_data":{"defaultBoot":defaultBoot,"nextBoot":nextBoot,"timeout":timeout}});
		} else {
			this.gotReadSettings(this,{"defaultBoot":defaultBoot,"nextBoot":nextBoot,"timeout":timeout,"save":true});
		}
	},
	callReadSettings: function() {
		if (window.PalmSystem) {
			this.$.readSettings.call();
		} else {
			this.mockReadSettingsServiceCall();
		}
	},
	mockReadSettingsServiceCall: function() {
		this.gotReadSettings(this, {"defaultBoot": "webOS", "nextBoot": "CyanogenMod"});
	},
	confirmRestart: function() {
		this.$.confirmRestartDialog.open();
	},
	callRestart: function() {
		this.$.restartDialog.openAtCenter();
		this.$.restartSpinner.show();
		this.doSave();
		if (window.PalmSystem) {
			console.log("Calling restart service");
			this.$.restart.call({});
		}
		this.$.saveCompleteDialog.close();
	},
	restartSuccess: function() {
		console.log("Restart returned");
	},
	checkNumbersOnly: function(inSender, inEvent) {
		var num_val = String.fromCharCode(inEvent.keyCode);
		var shortNumRegex = /^[1-9]{0,10}$/;
		if (!num_val.match(shortNumRegex)) {
			inEvent.preventDefault();
		}
	}
});