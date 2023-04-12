const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
const mongoose = require("mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const PREVIEW_MAX_LENGTH = 100;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const posts = [];

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  bodyPreview: String,
  link: String
});

const Post = mongoose.model("Post", postSchema);

function insertDefaultPosts() {
  Post.insertMany([
    {
      title: "Init post",
      body: "Initializing DB with Mongoose Initializing DB with Mongoose Initializing DB with Mongoose Initializing DB with Mongoose Initializing DB with Mongoose Initializing DB with Mongoose",
      bodyPreview: "Initializing DB with Mongoose Initializing DB with Mongoose Initializing DB with Mongoose Initializi...",
      link: "posts/Init post"
    }
  ]).then(function () {
    console.log("Successfully save default posts to blogDB");
  }).catch(function (err) {
    console.log(err);
  });
}

function findAllPosts() {
  return Post.find({});
}

function findPostByTitle(title) {
  return Post.findOne({ title: title });
}

app.get("/", async (req, res) => {
  const foundPosts = await findAllPosts();
  if (foundPosts.length === 0) {
    insertDefaultPosts();
    res.redirect("/");
  } else {
    res.render("home", { homeStarting: homeStartingContent, posts: foundPosts });
  }
});

app.get("/contact", async (req, res) => {
  res.render("contact", { contact: contactContent });
});

app.get("/about", async (req, res) => {
  res.render("about", { about: aboutContent });
});

app.get("/compose", async (req, res) => {
  res.render("compose", {});
});

app.get("/posts/:postTitle", async (req, res) => {
  const requestedTitle = _.capitalize(req.params.postTitle);
  const foundPost = await findPostByTitle(requestedTitle);
  let post = {
    postTitle: "Not found",
    postBody: "The post \"" + req.params.postTitle + "\" was not found"
  }
  if (foundPost) {
    post = {
      postTitle: foundPost.title,
      postBody: foundPost.body
    }
  }

  res.render("post", post);
});

app.post("/compose", function (req, res) {
  let bodyPreview = req.body.postBody;
  if (bodyPreview.length > PREVIEW_MAX_LENGTH) {
    bodyPreview = bodyPreview.slice(0, PREVIEW_MAX_LENGTH) + "...";
  }
  const post = new Post({
    title: _.capitalize(req.body.postTitle),
    body: req.body.postBody,
    bodyPreview: bodyPreview,
    link: "posts/" + _.capitalize(req.body.postTitle)
  });
  post.save();

  res.redirect("/");
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running")
  });
})
