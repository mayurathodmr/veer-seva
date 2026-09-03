const Datastore = require("@seald-io/nedb");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const donations = new Datastore({
  filename: path.join(dataDir, "donations.db"),
  autoload: true
});

donations.ensureIndex({
  fieldName: "donorId"
});

module.exports = donations;
