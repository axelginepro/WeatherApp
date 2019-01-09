var el = document.querySelectorAll('li');

function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 46,
			lng: 2
		},
		zoom: 5
	});

	for (var i = 0; i < el.length; i++) {
		console.log(el[i].dataset.lat);
		var marker = new google.maps.Marker({
			position: {
				lat: parseFloat(el[i].dataset.lat),
				lng: parseFloat(el[i].dataset.lon)
			},
			map: map
		});
	}
}