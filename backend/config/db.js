const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/digitalflake");
    console.log("mongodb connected " + conn.connection.host);
  } catch (error) {
    console.log("Error" + error.message);
    process.exit();
  }
};
module.exports = connectDb;