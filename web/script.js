const piosk = {
	renderPage(data) {
		$('#url').val(data.url);
		$('#page_timeout').val(data.page_timeout);
	},
	renderInfo(data) {
		$('#hostname').text(data.hostname);
		let interfaces = data.ip;
		let ip="";

		for(const [interface, data] of Object.entries(interfaces)){
			if(/^(eth|en|wlan)/.test(interface)){
				data.forEach(element => {
					if(element.family === "IPv4"){
						$('#ip').text(element.address);
						ip=element.address;
					}
				});
			}
		}

		new QRCode("qrcode", {
				text: `http://${ip}`,
				width: 300,
				height: 300,
				colorDark : "#FFFFFF",
				colorLight : "rgb(33, 37, 41)",
				correctLevel : QRCode.CorrectLevel.H
		});
	},
	renderTVStatus(data) {
		$('#controller').show();
		$('#power').text(data.powerStatus);
	},
	refreshTVStatus() {
		$.getJSON('/tv/status')
			.done(piosk.renderTVStatus);		
	},
	showStatus(xhr) {
		let tmpErr = $('#template-err').contents().clone();
		tmpErr.html(xhr.responseText);
		$('#settings').append(tmpErr);
		setTimeout(_ => { $('.alert-danger').remove() }, 5000);
	}
};

$(document).ready(() => {
	$.getJSON('/config')
		.done(piosk.renderPage)
		.fail(piosk.showStatus);

	$.getJSON('/sysinfo')
		.done(piosk.renderInfo)
		.fail(piosk.showStatus);

	// setInterval(piosk.refreshTVStatus, 30000);

	$('#execute').on('click', (e) => {
		const config = {
			url: $("#url").val(),
			page_timeout: parseInt($("#page_timeout").val())
		};

		$.ajax({
			url: '/config',
			type: 'POST',
			data: JSON.stringify(config),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: piosk.showStatus,
			error: piosk.showStatus
		});
	});

	$('#toggle-power').on('click', (e) => {
		$.ajax({
			url: '/tv/togglepower',
			type: 'POST',
			success: piosk.showStatus,
			error: piosk.showStatus
		});
	});

	$('#update').on('click', (e) => {
		$.ajax({
			url: '/update',
			type: 'POST',
			success: piosk.showStatus,
			error: piosk.showStatus
		});
	});
});
