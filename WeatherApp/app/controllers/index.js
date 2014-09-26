var nsIndex = {};

// Call to weather details
nsIndex.getWeatherDetails = function(latitude, longitude) {

	var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?lat="+latitude+"&lon="+longitude+"&units=metric";
	console.log(weatherUrl);
	
	var client = Titanium.Network.createHTTPClient({
		onload : function(e) {
			var response = JSON.parse(this.responseText);
			console.log("Success :" + this.responseText);
			
			var degree = "\u00B0";
			var temp = response.main.temp;
			
			$.lblWeatherType.setText(response.weather[0].main);
			$.lblTemperature.setText(temp+" "+ degree+"C");
			$.lblPlace.setText(response.name+", "+response.sys.country);
			$.ivWeatherIcon.setImage("http://openweathermap.org/img/w/"+response.weather[0].icon+".png");
		},
		onerror : function(e) {
			console.log("Error :" + this.responseText);
		}
	});

	client.open('GET', weatherUrl);
	client.setRequestHeader("Accept", "application/json");
	client.send();
};

// Call to get cordinates
nsIndex.getLocation = function(callback) {

	if (Titanium.Platform.osname === "android") {
		console.log("Titanium.Platform.osname " + Titanium.Platform.osname);

		Titanium.Geolocation.manualMode = true;
		var gpsProvider = Titanium.Geolocation.Android.createLocationProvider({
			name : Titanium.Geolocation.PROVIDER_GPS,
			minUpdateTime : 60,
			minUpdateDistance : 100
		});
		Titanium.Geolocation.Android.addLocationProvider(gpsProvider);

		var gpsRule = Titanium.Geolocation.Android.createLocationRule({
			provider : Titanium.Geolocation.PROVIDER_GPS,
			// Updates should be accurate to 100m
			accuracy : 100,
			// Updates should be no older than 5m
			maxAge : 300000,
			// But  no more frequent than once per 10 seconds
			minAge : 10000
		});
		Titanium.Geolocation.Android.addLocationRule(gpsRule);

	} else {
		console.log("Titanium.Platform.osname " + Titanium.Platform.osname);
		Titanium.Geolocation.purpose = "To get the user's location";
		Titanium.Geolocation.distanceFilter = 10;
		Titanium.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
		var authCode = Titanium.Geolocation.locationServicesAuthorization;

		if (authCode === Titanium.Geolocation.AUTHORIZATION_ALWAYS) {
			console.log('AUTHORIZATION_ALWAYS');
		} else if (authCode === Titanium.Geolocation.AUTHORIZATION_WHEN_IN_USE) {
			console.log('AUTHORIZATION_WHEN_IN_USE');
		} else {
			console.log('NOT AUTHORIZED :(');
		}

		Titanium.Geolocation.addEventListener('authorization', function(e) {
			console.log("Authorization");

		});
	}
	Titanium.Geolocation.getCurrentPosition(function(e) {
		console.log("getCurrentPosition");
		if (e.error) {
			console.log("Error: " + e.error);
		} else {
			if (e.coords !== "undefined") {
				console.log("Success: " + e.coords.latitude + "  " + e.coords.longitude);
			} else {
				console.log(JSON.stringify(e));
			}
		}
	});

	Titanium.Geolocation.addEventListener('location', function(e) {
		console.log("Location: " + JSON.stringify(e));
		if (e.coords) {
			console.log(e.coords.longitude + "   " + e.coords.latitude);
			nsIndex.getWeatherDetails(e.coords.latitude, e.coords.longitude);
		}
	});
};

nsIndex.init = function() {
	if (Titanium.Network.online) {
		nsIndex.getLocation();
	} else {
		alert("Some error occurred");
	}

	$.winIndex.open();
};

nsIndex.init();
