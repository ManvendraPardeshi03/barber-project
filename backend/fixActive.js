const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Service = require("./models/Service");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

async function fixActiveField() {
  const res = await Service.updateMany(
    { active: { $exists: false } }, // services without active field
    { $set: { active: true } }      // set them to true
  );
  console.log("Updated services:", res.modifiedCount);
  mongoose.disconnect();
}

fixActiveField();
