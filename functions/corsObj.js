const corsObj = {
  origin: [
    "https://the-widget-folks.netlify.app",
    "http://localhost:3000",
    "http://localhost:39447",
  ],
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  credentials: true,
};

module.exports = corsObj;
