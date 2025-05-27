const exp = require('express');
const Cec = require('cec-controller');
const { exec } = require('child_process');
const nfs = require('fs');
const os = require('os');

const cec = new Cec();

let controller = null;

cec.on('ready', ctl => {
	controller = ctl;
});
cec.on('error', console.error);

const app = exp();

app.use(exp.static('web'));
app.use(exp.json());

app.get('/config', (req, res) => {
	res.sendFile(__dirname + '/config.json');
});

app.post('/config', (req, res) => {
	nfs.writeFile('./config.json', JSON.stringify(req.body, null, "	"), err => {
		if (err) {
			console.error(err);
			res.status(500).send('Could not save config.');
		}
		exec('sudo reboot', err => {
			if (err) {
				console.error(err);
				res.status(500).send('Could not reboot to apply config. Retry or reboot manually.');
			}
			res.status(200).send('New config applied; rebooting for changes to take effect...');
		});
	});
});

app.post('/reboot', (req, res) => {
	exec('sudo reboot', err => {
		if (err) {
			console.error(err);
			res.status(500).send('Could not reboot. Retry or reboot manually.');
		}
		res.status(200).send('Rebooting...');
	});
});

app.post('/refresh', (req, res) => {
	exec('wtype -M ctrl r -m ctrl', err => {
		if (err) {
			console.error(err);
			res.status(500).send('Could send the refresh command. Retry or refresh manually.');
		}
		res.status(200).send('Refreshing...');
	});
});

app.get('/update', (req, res) => {
	exec(__dirname + '/scripts/checkupdate.sh', (err, stdout) => {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		}
		res.json({ status: stdout });
	});
});

app.post('/update', (req, res) => {
	exec(__dirname + '/scripts/update.sh', (err, stdout) => {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		}
		res.status(200).send(stdout);
	});
});

app.get('/desktop', (req, res) => {
	const child = exec('grim /tmp/screenshot.png', (err) => {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		}
		res.sendFile('/tmp/screenshot.png');
	});
});

app.get('/sysinfo', (req, res) => {
	res.json({
		hostname: os.hostname(),
		ip: os.networkInterfaces()
	});
});

app.get('/tv/status', (req, res) => {
	res.json({ ...controller });
});

app.post('/tv/togglepower', async (req, res) => {
	try {
		const success = await tv.togglePower();
		res.status(200).send('TV power has been toggled.');	
	} catch (err) {
		res.status(500).send('Could not send input key.');
	}
});

app.listen(80, console.error);
