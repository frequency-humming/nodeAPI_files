/* eslint-disable */
const express = require('express');
const jsforce = require('jsforce');
const app = express();
const https = require('https');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

let token = '';
const PORT = 3001;
const { SF_LOGIN_URL, SF_USERNAME, SF_PASSWORD, SF_TOKEN } = process.env;
const conn = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});

conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN, (err, userInfo) => {
    if (err) {
        console.error(err);
    } else {
        console.log('User ID: ' + userInfo.id);
        console.log('Org ID: ' + userInfo.organizationId);
        token = conn.accessToken;
        console.log('AccessToken ' + conn.accessToken);
    }
});
app.get('/', (req, res) => {
    conn.query(
        'SELECT ID,Title, VersionData FROM CONTENTVERSION',
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                //console.log(result.records);
                let data = new Array();
                for (x in result.records) {
                    data.push({
                        name: result.records[x].Title,
                        URL: result.records[x].VersionData
                    });
                }
                console.log(data[0].name);
                files(data);
                res.send('ok');
            }
        }
    );
});

async function files(data) {
    let apiRequest = [];
    for(let index of data){
        console.log(index)
        apiRequest.push(download(index));
    }
    let complete = await Promise.all(apiRequest);
}

function download(index) {
    let FileName = index.name;
    axios({
        url: `https://resilient-bear-l245ow-dev-ed.my.salesforce.com${index.URL}`,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'OAuth ' + token
        },
        responseType: 'stream'
      })
        .then(function (response) {
          response.data.pipe(fs.createWriteStream(FileName));
        })
        .catch(function (error) {
            console.log(error);
        });
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
