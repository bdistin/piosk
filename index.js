const exp = require('express');
//const Cec = require('cec-controller');
const { exec, spawn } = require('child_process');
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
  const grimProcess = spawn('grim', ['-']);  // `-` outputs to stdout

  // Set the appropriate Content-Type header for the image
  res.setHeader('Content-Type', 'image/png');

  // Pipe the output of grim to the Express response
  grimProcess.stdout.pipe(res);

  grimProcess.stderr.on('data', (data) => {
    console.error(`grim stderr: ${data}`); // Handle grim errors
  });

  grimProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`grim process exited with code ${code}`);
      res.status(500).send('Error taking screenshot');
    }
  });
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
