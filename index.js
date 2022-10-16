const express = require('express');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.urlencoded({extended: true}));

let acctoken = '';
const PORT = 3001;
const { SF_LOGIN_URL, SF_USERNAME, SF_PASSWORD, SF_TOKEN,SF_INSTANCE,CONSUMER_KEY,CONSUMER_SECRET } = process.env;

app.post('/testingpattern',async (req, res) => {
    let name = req.body.filename;
    let url = req.body.url;
    acctoken = await authReq();
    if(acctoken){
        let file = await download(name,url);
        if(file){
            console.log(file);
            res.send(file);
        }
    }
});

async function files(data) {
    let apiRequest = [];
    for(let index of data){
        console.log(index)
        apiRequest.push(download(index));
    }
    let complete = await Promise.all(apiRequest);
}

async function download(name,url) {
    let FileName = name;
    return axios({
        url: SF_INSTANCE+url,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer ' + acctoken
        },
        responseType: 'stream'
      })
        .then(function (response) {
          response.data.pipe(fs.createWriteStream(`${__dirname}/documents/${FileName}`));
        }).then(function(){
            return 'Completed';
        })
        .catch(function (error) {
            console.log(error);
            return 'Error';
        });
}

async function authReq() {
    var data = {
        'grant_type': 'password',
        'client_id': CONSUMER_KEY,
        'client_secret': CONSUMER_SECRET,
        'username': SF_USERNAME,
        'password': SF_PASSWORD+SF_TOKEN
      };
      var config = {
        method: 'post',
        url: SF_LOGIN_URL,
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
      };
      
      const callout = await axios(config);
      const calloutRequest = async () => {
        await callout;
      }
      return callout.data.access_token;
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


