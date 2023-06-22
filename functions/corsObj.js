const corsObj = {
  origin: ["https://the-widget-folks.netlify.app"],
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  credentials: true,
};

module.exports = corsObj;
