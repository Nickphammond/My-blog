//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

// let posts = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/blogslistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});



const postSchema = new mongoose.Schema({
  title: String,
  lowerTitle: String,
  body: String,
  click: String
});

const Post = mongoose.model("Post", postSchema);


const listSchema = new mongoose.Schema({
  name: String,
  items: [postSchema]
});

const List = mongoose.model("List", listSchema);




List.findOne({
  name: "posts"
}, function(err, things) {

  if (err) {
    console.log(err);
  } else {
    if (!things) {
      const list = new List({
        name: "posts",
        items: []
      });

      list.save();

      console.log("created new list");
    } else {
      console.log("list already exists");
    }
  }
});





app.get("/", function(req, res) {

  List.findOne({
    name: "posts"
  }, function(err, foundList) {

    if (err) {
      console.log(err);
    } else {

      res.render("home", {
        homeStartingContent: homeStartingContent,
        postList: foundList.items
      });
    }

  });

});


app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    contactContent: contactContent
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req, res) {

  const post = new Post({
    title: req.body.postTitle,
    lowerTitle: _.lowerCase(req.body.postTitle),
    body: req.body.postBody,
    click: "/posts/" + _.kebabCase(_.lowerCase(req.body.postTitle))
  });

  List.findOne({
    name: "posts"
  }, function(err, foundList) {
    if (err) {
      console.log(err);
    } else {
      foundList.items.push(post);

      foundList.save();
    }
  });


  res.redirect("/");

});




app.get("/posts/:postId", function(req, res) {

  const requestedTitle = _.lowerCase(req.params.postId);



  List.findOne({
    name: "posts"
  }, function(err, foundList) {


    foundList.items.forEach(function(post) {

      const blogTitle = _.lowerCase(post.title);


      if (requestedTitle === blogTitle) {
        res.render("post", {
          postTitle: post.title,
          postContent: post.body
        });
        console.log("Match");
      } else {
        console.log("Not a match!");
        console.log(req.params.postId);
      }
    });

  });


});








app.listen(3000, function() {
  console.log("Server started on port 3000");
});
