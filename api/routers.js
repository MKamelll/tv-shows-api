// router instance
const router = require('express').Router();

// locals
const {
  queryBasic,
  queryPosters,
  queryActors,
  queryEpisodes
} = require('./queryAPI');

// home route
router.get('/', (req, res, next) => {
  res.json({
    'message': 'Ground Control To Major Tom!'
  });
});

// basic details
router.get('/series/:name', async (req, res, next) => {
  let name = req.params.name;
  let data = await queryBasic(name);
  res.json(data);
});

// posters
router.get('/series/posters/:name', async (req, res, next) => {
  let name = req.params.name;
  let data = await queryPosters(name);
  res.json(data);
});

// actors
router.get('/series/actors/:name', async (req, res, next) => {
  let name = req.params.name;
  let data = await queryActors(name);
  res.json(data);
});

// episodes 1st page by default
router.get('/series/episodes/:name', async (req, res, next) => {
  let name = req.params.name;
  let page = req.query.page;
  let data;
  if (page) {
    data = await queryEpisodes({ name, page });
  } else {
    data = await queryEpisodes({ name });
  }
  res.json(data);
});

// exports
module.exports = {
  router
};
