const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const args = process.argv;
const dictFilePath = typeof args[2] === 'string' ? args[2] : './userDict.json';
console.log(`Using dict file ${dictFilePath}`);

let dicts = {uDict: [], oDict: []};
try {
  let file = fs.readFileSync(dictFilePath);
  console.log("Read dict file");
  dicts = JSON.parse(file);
  console.log("Parsed dict file");
}catch (err) {
  console.log(`Failed to read file ${dictFilePath}. Initializing empty dict file. `);
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toString()}: ${req.method}`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
    
  if (req.method === 'GET') {
    res.end(JSON.stringify(dicts));

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
          if (!Array.isArray(dict) || !Array.isArray(nDict)) return;
          for (let w of nDict) {
            if (dict.includes(w) === false) dict.push(w);
          }
        };
        merge(dicts.uDict, newDict.uDict);
        merge(dicts.oDict, newDict.oDict);

        // Remove oDict words that are in uDict
        dicts.oDict = dicts.oDict.filter(w => !dicts.uDict.includes(w));

        console.log('Writing changes to file system');
        let outData = JSON.stringify(dicts);
        fs.writeFileSync(dictFilePath, outData);
        console.log('\tDone');

        res.end();
      }catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end();
      }
    });
  }else if (req.method === 'DELETE') {
    let rawData = '';
    req.on('data', (data) => {
      rawData += data;
    });
    req.on('end', () => {
      let rDict = JSON.parse(rawData);

      if (!Array.isArray(rDict.uDict)) rDict.uDict = [];
      if (!Array.isArray(rDict.oDict)) rDict.oDict = [];

      dicts.uDict = dicts.uDict.filter(w => !rDict.uDict.includes(w));
      dicts.oDict = dicts.oDict.filter(w => !rDict.oDict.includes(w));
    });
    res.end();
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
