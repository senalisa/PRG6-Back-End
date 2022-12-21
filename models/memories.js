// Require Mongoose
const mongoose = require("mongoose");

// Define schema
const Schema = mongoose.Schema;

const memorySchema = new Schema({
  title: String,
  memory: String,
  points: String,
  date: String,
  author: String
}, {toJSON: {virtuals: true}});

//Virtual property to include dynamic links
memorySchema.virtual('_links').get(
   function()  {
    return {
        self: {
          href: `${process.env.BASE_URI}${this._id}`
      },
      collection: {
          href: `${process.env.BASE_URI}`
      }
    }
  }
)

// Export function to create "Memory" model class
module.exports = mongoose.model("Memory", memorySchema);