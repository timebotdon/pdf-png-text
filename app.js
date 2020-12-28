const { sep } = require('path');
const { setOptions, convert } = require('pdf2img');
const { createWorker } = require('tesseract.js');

function convertToImage(documentPath) {
  return new Promise((resolve, reject) => {
    setOptions({
      type: 'png',
      size: 1024,
      density: 300,
      outputdir: `${__dirname}${sep}output`,
      outputname: 'out',
      page: 0,
      quality: 100
    });

    convert(documentPath, (err, data) => {
      if (err) {
        reject(err)
      } else {
        console.log('Completed conversion: PDF -> PNG');
        resolve(data);
      }
    });
  });
}

async function convertToText(filePath, callback) {
  const worker = createWorker({
    logger: m => {
      if (m.status == 'recognizing text') {
        console.log(`Progress: ${(m.progress).toFixed(2) * 100}%`) // Add logger here
      }
    }
  });

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const {
    data: {
      text
    }
  } = await worker.recognize(filePath);
  await worker.terminate();
  return callback(text);
}


const documentFileName = process.argv[2]
const documentPath = `${__dirname}/${documentFileName}`;
convertToImage(documentPath)
  .then((result) => {
    convertToText(result.message[0].path, (data) => {
      console.log(data)
    })
  })
  .catch((error) => {
    console.log(error)
  })