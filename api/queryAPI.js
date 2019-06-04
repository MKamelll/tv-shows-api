// dependencies
require('dotenv').config();
const fs = require('fs');

// local modules
const { API } = require('./APIwrapper');
const { token } = require('../token.json');
const apiKey = process.env.APIKEY;

// instance of the wrapper
const api = new API({
  token,
  apiKey
});

// get the basic details for a show
// return the search result and the function that made the call
async function queryBasic(name) {
  let response = await api.searchSeries(name).catch();
  let validStatus = await validResponse(response, queryBasic, name).catch();
  if (validStatus === true) {
    return response;
  }
}

// gets the posters
async function queryPosters(name) {
  let response = await api.getGraphs(name).catch();
  let validStatus = await validResponse(response, queryPosters, name).catch();
  if (validStatus === true) {
    return response;
  }
}

// get all actors for a show
async function queryActors(name) {
  let response = await api.getActors(name).catch();
  let validStatus = await validResponse(response, queryActors, name).catch();
  if (validStatus === true) {
    return response;
  }
}

// get all the episodes for the show
async function queryEpisodes({ name, page = null }) {
  if (page) {
    page = page.toString();
  }
  let response = await api.getEpisodes({ showName: name, page }).catch();
  let validStatus = await validResponse(response, queryEpisodes, name).catch();
  if (validStatus === true) {
    return response;
  }
}

/*
  validation for response['Error']
  incase resorce not found the error gets returned
  just miss-typing
  incase of new token it writes it to the file overwriting 
  the old one and change the value for the api property
  to repeat the request after 2 seconds
*/
async function validResponse(response, caller, name) {
  if (response['Error']) {
    if (response['Error'] === 'Not authorized') {
      let newToken = await api.getToken().catch();
      let fileToken = {
        'token': newToken
      };
      let w = fs.createWriteStream('./token.json');
      w.write(JSON.stringify(fileToken));
      api.token = newToken;
      await sleep(2000).catch();
      return await caller(name);
    }
  } else {
    return true;
  }
}

// sleeping
async function sleep(time) {
  return new Promise((resolve, reject) => {
    if (time) {
      setTimeout(() => {
        resolve();
      }, time);
    } else {
      reject('You Didnt Set A Duration!');
    }
  });
}

// exports
module.exports = {
  queryBasic,
  queryPosters,
  queryActors,
  queryEpisodes
};
