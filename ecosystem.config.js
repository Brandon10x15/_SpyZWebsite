module.exports = {
    apps : [{
      name: "spyzfeed",
      script: "./start-prod.js",
      env: {
        NODE_ENV: "production",
      }
    }]
  }