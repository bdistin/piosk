const exp = require('express');
//const Cec = require('cec-controller');
const screenshot = require('screenshot-desktop-wayland');
const { exec } = require('child_process');
const nfs = require('fs');
const os = require('os');

//const cec = new Cec();

//let tv = null;

//cec.on('ready', controller => {
//	tv = controller.dev0;
//});
//cec.on('error', console.error);

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
		exec('reboot', err => {
			if (err) {
				console.error(err);
				res.status(500).send('Could not reboot to apply config. Retry or reboot manually.');
			}
			res.status(200).send('New config applied; rebooting for changes to take effect...');
		});
	});
});

app.post('/update', (req, res) => {
	exec('sudo ' + __dirname + '/scripts/update.sh', (err, stdout) => {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		}
		res.status(200).send(stdout);
	});
});

app.get('/desktop', (req, res) => {
	screenshot().then(img => {
		res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    	img.pipe(res);
	})
});

app.get('/sysinfo', (req, res) => {
	res.json({
		hostname: os.hostname(),
		ip: os.networkInterfaces()
	});
});

/*app.get('/tv/status', (req, res) => {
	res.json({ ...tv });
});

app.post('/tv/togglepower', (req, res) => {
	tv.togglePower().then(success => {
		if(success)
			res.status(200).send('TV power has been toggled.');
		else
			res.status(500).send('Could not send input key.');
	});
});*/

app.listen(80, console.error);
