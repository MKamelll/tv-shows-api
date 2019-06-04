// dependencies
const fetch = require('node-fetch');

// a tvdb API wrapper
class API {
  // the instance gets both the token if present and the key
  constructor({ token = null, apiKey = null }) {
    this.token = token;
    this.apiKey = apiKey;
  }
  // method to generate token as it is expired after 24hrs
  async getToken() {
    const loginURL = 'https://api.thetvdb.com/login';
    let res = await fetch(loginURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'apikey': this.apiKey
      })
    });
    let data = await res.json();
    if (data['token']) {
      let newToken = data['token'];
      return newToken;
    }
    return data;
  }

  // a method to refresh the token within the 24hrs span sending the old one
  async refreshToken() {
    const refreshTokenURL = 'https://api.thetvdb.com/refresh_token';
    let res = await fetch(refreshTokenURL, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    let data = await res.json();
    if (data['token']) {
      let refreshToken = data['token'];
      return refreshToken;
    }
    return data;
  }

  // search for a show by a name returns object of arrays
  // show at response['data'][0]
  async searchSeries(showName) {
    showName = showName.replace(/\s/g, '-');
    const searchURL = `https://api.thetvdb.com/search/series?slug=${showName}`;
    let res = await fetch(searchURL, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    let json = await res.json();
    if (!json['data']) {
      return json;
    }
    let show = json['data'][0];
    let graphURL = 'https://www.thetvdb.com/banners/';
    return {
      'data': true,
      'id': show['id'],
      'banner': `${graphURL}${show['banner']}`,
      'name': show['seriesName'],
      'overview': show['overview'],
      'network': show['network'],
      'status': show['status']
    };
  }

  // gets all posters for a show
  // request is made with the show id
  // return an array of objects
  // mapping through to append the main link to it
  async getGraphs(showName) {
    let show = await this.searchSeries(showName);
    if (typeof show['id'] === 'number') {
      let searchGraphURL = `https://api.thetvdb.com/series/${
        show['id']
      }/images/query?keyType=poster`;
      let res = await fetch(searchGraphURL, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      let data = await res.json();
      if (data['data']) {
        let graphURL = 'https://www.thetvdb.com/banners/';
        let posters = data['data'].map(i => graphURL + i.fileName);
        return posters;
      } else {
        return data;
      }
    }
    return show;
  }

  // gets all actors for a show as an array of objects
  async getActors(showName) {
    let show = await this.searchSeries(showName);
    if (typeof show['id'] === 'number') {
      let actorsURL = `https://api.thetvdb.com/series/${show['id']}/actors`;
      let res = await fetch(actorsURL, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      let json = await res.json();
      if (!json['data']) {
        return json;
      }
      let graphURL = 'https://www.thetvdb.com/banners/';
      return json['data'].map(actorOb => ({
        'name': actorOb['name'],
        'role': actorOb['role'],
        'image': `${graphURL}${actorOb['image']}`
      }));
    } else {
      return show;
    }
  }

  // that get all episodes of a show
  // if no page is not provided it returns page 1
  // by default with 100 results per page
  async getEpisodes({ showName, page = null }) {
    let show = await this.searchSeries(showName);
    if (typeof show['id'] === 'number') {
      let episodesURL;
      if (page && typeof page === 'string') {
        episodesURL = `https://api.thetvdb.com/series/${
          show['id']
        }/episodes?page=${page}`;
      } else {
        episodesURL = `https://api.thetvdb.com/series/${show['id']}/episodes`;
      }
      let res = await fetch(episodesURL, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      let json = await res.json();
      return json;
    } else {
      return show;
    }
  }
}

// exports
module.exports = {
  API
};
