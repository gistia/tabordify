const fs = require('fs');
const Converter = require('csvtojson').Converter;
const json2csv = require('json2csv');
const _ = require('lodash');

if (!fs.existsSync('./processed')){
  fs.mkdirSync('./processed');
}

fs.readdir('./', (err, files) => {
  files.forEach(f => {
    if (f.match(/\.csv$/)) {
      console.log(`Processing ${f}`);
      const contents = fs.readFileSync(f, 'utf8');

      const converter = new Converter({});
      converter.fromString(contents, (err, rawResults) => {
        const source = _.filter(rawResults, r => r['First name']);
        const names = source.map(r => `${r['First name']} ${r['Last name']}`);

        const target = [];
        source.forEach(row => {
          const otherNames = _.filter(names, name => name !== `${row['First name']} ${row['Last name']}`);
          otherNames.forEach((name, i) => {
            row[`Other Name ${i+1}`] = name;
          })
          target.push(row);
        });

        const output = [];
        output.push(Object.keys(target[0]).map(f => `"${f}"`).join(','));
        target.map(row => {
          output.push(Object.keys(row).map(f => row[f]).map(f => `"${f}"`).join(','));
        });

        fs.writeFile(`./processed/${f}`, output.join('\n'), 
          err => { 
            if (err) {
              console.log('Error', err);
            } 
          });
      });
    }
  });
});
