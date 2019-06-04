// dependencies
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { router } = require('./api/routers');

// app instance
let app = express();

app.use(morgan('tiny'));
app.use(cors());

// our routing handler
app.use('/', router);

// port and start ..
const port = process.env.PORT;
app.listen(port, () => {
  console.log('server is running on port', port);
});
