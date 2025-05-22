const exp = require('express');
const stream = require('node-rtsp-stream');
const Cec = require('cec-controller');
const { exec } = require('child_process');
const nfs = require('fs');
const os = require('os');

const cec = new Cec();

let tv = null;

cec.on('ready', controller => {
	tv = cont.dev0;
});
cec.on('error', console.error);

const app = exp();

app.use(exp.static('web'));
app.use(exp.json());

app.get('/config', (req, res) => {
	res.status(200).sendFile(__dirname + '/config.json');
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
	exec('sudo ' + __dirname + '/scripts/update.sh', err => {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		}
		res.status(200).send('New update applied; rebooting for changes to take effect...');
	});
});

app.get('/sysinfo', (req, res) => {
	res.json({
		hostname: os.hostname(),
		ip: os.networkInterfaces()
	});
});

app.get('/stream', (req, res) => {
	const myStream = new stream({
		name: 'streamName',
		streamUrl: 'udp://127.0.0.1:1234', // URL where ffmpeg is streaming to
		wsPort: 9999, // port for websocket stream
		ffmpegOptions: { // Options for ffmpeg
		  '-stats': '', // an option with no argument
		  '-r': 30,
		  '-f': 'mpegts',
		},
	  });
	
	myStream.pipe(res); 
});

app.get('/tv/status', (req, res) => {
	res.json({ ...tv });
});

app.post('/tv/togglepower', (req, res) => {
	tv.togglePower().then(success => {
		if(success)
			res.status(200).send('TV power has been toggled.');
		else
			res.status(500).send('Could not send input key.');
	});
});


app.listen(80, console.error);
