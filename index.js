const { server } = require('./server');

const port = 8099;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
