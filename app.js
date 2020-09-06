const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const dictFilePath = './userDict.json';

let uDict = {uDict: [], oDict: []};
try {
  let file = fs.readFileSync(dictFilePath);
  let uDict = JSON.parse(file);
}catch (err) {
  console.log(`Failed to read file ${dictFilePath}. Initializing empty dict file. `);
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toString()}: ${req.method}`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
    
  if (req.method === 'GET') {
    res.end(JSON.stringify(uDict));

  }else if (req.method === 'POST') {
    let rawData = '';
    req.on('data', (data) => {
      rawData += data;
    });
    req.on('end', () => {
      try {
        let newDict = JSON.parse(rawData);

        console.log('Merging dicts');
        let merge = (dict, nDict) => {
          for (let w of nDict) {
            if (dict.includes(w) === false) dict.push(w);
          }
        };
        merge(uDict.uDict, newDict.uDict);
        merge(uDict.oDict, newDict.oDict);

        console.log('Writing changes to file system');
        let outData = JSON.stringify(uDict);
        fs.writeFileSync(dictFilePath, outData);
        console.log('\tDone');

        res.end();
      }catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end();
      }
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated')
  })
})
