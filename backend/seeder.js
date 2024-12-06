import users from "./data/users.js";
import products from "./data/products.js";
import User from "./models/user.model.js";
import Recipe from "./models/recipe.model.js";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import colors from "colors";

// process.loadEnvFile();
dotenv.config();

connectDb();

async function loadData() {
  try {
    await Recipe.deleteMany();
    await User.deleteMany();

    let newusers = await User.insertMany(users);
    await Recipe.insertMany(
      products.map((product) => {
        return {
          ...Recipe,
          user: newusers[0]._id,
        };
      })
    );
    console.log("Data Loaded!".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

async function destroyData() {
  try {
    await User.deleteMany();
    await Recipe.deleteMany();
    console.log("Data Cleared!".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

if (process.argv[2] == "-d") {
  destroyData();
} else {
  loadData();
}
