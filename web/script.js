const piosk = {
	dataRefresh() {
		piosk.refreshDesktop();
		piosk.getUpdateStatus();
		piosk.refreshTVStatus();
	},
	renderPage(data) {
		$('#url').val(data.url);
		$('#page_timeout').val(data.page_timeout);
	},
	renderQRs(data) {
		$('#hostname').text(data.hostname);
		const interfaces = data.ip;
		let i=0;

		for(const [interface, data] of Object.entries(interfaces)){
			if(/^(eth|en|wlan)/.test(interface)){
				data.forEach(element => {
					if(element.family === "IPv4"){
						const tmpQR = $('#template-qr').contents().clone();
						const id = "qrcode"+i++;
						tmpQR.find('#ip').text(element.address);
						tmpQR.find('.qr').attr("id", id);
						$('#qr-cards').append(tmpQR);
						new QRCode(id, {
							text: `http://${element.address}`,
							width: 300,
							height: 300,
							colorDark : "#FFFFFF",
							colorLight : "rgb(33, 37, 41)",
							correctLevel : QRCode.CorrectLevel.H
						});
					}
				});
			}
		}
		
	},
	refreshDesktop() {
		const timestamp = new Date().getTime();
    	const imageElement = $('#desktop');
    	const currentSrc = imageElement.attr('src');
    
    	//Remove existing query parameters
    	const cleanSrc = currentSrc.split('?')[0];
    
    	imageElement.attr('src', cleanSrc + '?' + timestamp);
	},
	getUpdateStatus() {
		$.getJSON('/update')
			.done(piosk.renderUpdateStatus)
			.fail(piosk.renderUpdateStatus);
	},
	renderUpdateStatus(data) {
		$('#update-status').text(data.status);
	},
	renderTVStatus(data) {
		if (data.dev0) {
			$('#tv-controls').show();
			$('#tv-power-status').text(data.dev0.powerStatus);
		} else {
			$('#tv-controls').hide();
		}
	},
	refreshTVStatus() {
		$.getJSON('/tv/status')
			.done(piosk.renderTVStatus)
			.fail(piosk.renderTVStatus);		
	},
	showErr(xhr) {
		const tmpErr = $('#template-err').contents().clone();
		tmpErr.html(typeof xhr === 'string' ? xhr : xhr.responseText);
		$('#screen').append(tmpErr);
		setTimeout(_ => { $('.alert-danger').remove() }, 5000);
	},
	showSuc(xhr) {
		const tmpErr = $('#template-suc').contents().clone();
		tmpErr.html(typeof xhr === 'string' ? xhr : xhr.responseText);
		$('#screen').append(tmpErr);
		setTimeout(_ => { $('.alert-success').remove() }, 5000);
	},
	showUpdateStatus(xhr) {
		$('#update-text').html(typeof xhr === 'string' ? xhr : xhr.responseText);
	}
};

function isValidURL(string) {
	try {
		new URL(string);
		return true;
	} catch (error) {
		return false;
	}
}

function isIntegerString(string) {
	if (typeof string !== 'string') {
		return false;
	}
	if (string.trim() === '') {
		return false;
	}
	const num = Number(string);
	return Number.isInteger(num);
}

$(document).ready(() => {
	$.getJSON('/config')
		.done(piosk.renderPage)
		.fail(piosk.showErr);

	$.getJSON('/sysinfo')
		.done(piosk.renderQRs)
		.fail(piosk.showErr);
	
	piosk.dataRefresh();
	setInterval(piosk.dataRefresh, 5000);

	$('#execute').on('click', (e) => {
		if (!isValidURL($("#url").val())) {
			return piosk.showErr('Invalid URL syntax');
		}
		if (!isIntegerString($("#page_timeout").val())) {
			return piosk.showErr('Idle Refresh Timeout must be a valid integer');
		}

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
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#tv-power').on('click', (e) => {
		$.ajax({
			url: $('#tv-power-status').text() !== 'on' ? '/tv/power/on' : '/tv/power/off',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#tv-volume-up').on('click', (e) => {
		$.ajax({
			url: '/tv/volume/up',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#tv-volume-mute').on('click', (e) => {
		$.ajax({
			url: '/tv/volume/mute',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#tv-volume-down').on('click', (e) => {
		$.ajax({
			url: '/tv/volume/down',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#refresh').on('click', (e) => {
		$.ajax({
			url: '/refresh',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#reboot').on('click', (e) => {
		$.ajax({
			url: '/reboot',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#update').on('click', (e) => {
		$('#update-text').html($('#template-loading').html());
		$.ajax({
			url: '/update',
			type: 'POST',
			success: piosk.showUpdateStatus,
			error: piosk.showUpdateStatus
		});
	});
});
