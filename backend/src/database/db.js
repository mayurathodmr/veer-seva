const Datastore = require("@seald-io/nedb");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = {
  users: new Datastore({
    filename: path.join(dataDir, "users.db"),
    autoload: true
  })
};

db.users.ensureIndex(
  {
    fieldName: "email",
    unique: true
  },
  (err) => {
    if (err) {
      console.error("❌ Email index error:", err.message);
    } else {
      console.log("✅ Users database ready");
    }
  }
);

module.exports = db;
