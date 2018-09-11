require("ts-node/register");

const { setup } = require("./setup");

module.exports = async () => {
  // Call your initialization methods here.
  if (!process.env.TEST_HOST) {
    await setup();
  }
  return null;
};
