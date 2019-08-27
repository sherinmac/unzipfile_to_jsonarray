var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var path = require('path');
const unzipper = require("unzipper");
const filetempPath = '/home/sherin_ag/project_express/unzip_temp.txt';

var unzipFile = (filePath) => {

    return new Promise((resolve, reject) => {

        try {
            fs.createReadStream(filePath)
                .pipe(unzipper.Parse())
                .on('entry', function (entry) {
                    const fileName = entry.path;
                    // console.log(fileName);
                    const type = entry.type; // 'Directory' or 'File'
                    const size = entry.vars.uncompressedSize; // There is also compressedSize;
                    if (fileName) {
                        console.log(fileName);
                        entry.pipe(fs.createWriteStream(filetempPath));
                        resolve("success");
                    } else {
                        entry.autodrain();
                    }
                });

        } catch (error) {
            reject(error);
        }

    });

};

const writeJson = () => {

    return new Promise((resolve, reject) => {
        try {
            let res = [];
            var LineByLineReader = require('line-by-line'),
                lr = new LineByLineReader(filetempPath);

            lr.on('error', function (err) {
                reject(err);
            });

            lr.on('line', function (line) {
                lr.pause();
                setTimeout(function () {
                    res.push({ filename: line });
                    lr.resume();
                }, 100);
            });

            lr.on('end', function () {
                fs.unlinkSync(filetempPath);
                resolve(res);
            });
        }
        catch (err) {
            reject(err);

        }
    });

}

app.get('/', function (req, res) {
    res.send('Hi i am,Default');
    //res.end('Hi i am,Default');
});


app.post('/filesTypes', function (req, res) {

    console.log(req.body.filepath);
    var filePath = req.body.filepath;
    if (fs.existsSync(filePath)) {
        (async () => {
            //var filePath = '/home/sherin_ag/project_workshop/start.zip';
            await unzipFile(filePath);
            console.log("Unzip completed");
            console.log("Reading  file started");
            await writeJson().then(result => {
                console.log(result);
                res.send(result);
            });
            console.log('End of File');
        })();
    }
    else {
        console.log('File not exist');
        res.end('File not exist');
    }

});

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)

});