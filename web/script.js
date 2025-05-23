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
	showErr(xhr) {
		let tmpErr = $('#template-err').contents().clone();
		tmpErr.html(typeof xhr === 'string' ? xhr : xhr.responseText);
		$('#settings').append(tmpErr);
		setTimeout(_ => { $('.alert-danger').remove() }, 5000);
	},
	showSuc(xhr) {
		let tmpErr = $('#template-suc').contents().clone();
		tmpErr.html(typeof xhr === 'string' ? xhr : xhr.responseText);
		$('#settings').append(tmpErr);
		setTimeout(_ => { $('.alert-success').remove() }, 5000);
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
		.done(piosk.renderInfo)
		.fail(piosk.showErr);

	// setInterval(piosk.refreshTVStatus, 30000);

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

	$('#toggle-power').on('click', (e) => {
		$.ajax({
			url: '/tv/togglepower',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});

	$('#update').on('click', (e) => {
		$.ajax({
			url: '/update',
			type: 'POST',
			success: piosk.showSuc,
			error: piosk.showErr
		});
	});
});
