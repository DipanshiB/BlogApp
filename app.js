var http = require("http");
var port = 3000;
var hostname = '127.0.0.1';
var server = http.createServer(function(req, res){
  res.statusCode = 200;
});

//APP CONFIG
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public")); //NEW - FOR USING CUSTOM STYLESHEETS
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.set("view engine", "ejs");

//MONGOOSE/MODEL CONFIG
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog_app", {useNewUrlParser : true});
mongoose.set('useFindAndModify', false);
var blogSchema = new mongoose.Schema({
  title   : String,
  image   : String,
  body    : String,
  created : {type : Date, default : Date.now()}
});
var Blog = mongoose.model("Blog", blogSchema);
// Blog.create({
//   title : "Poetry as Art",
//   image : "https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80.jpg",
//   body  : "Poetry is an ancient form of art - possibly the purest there is..."
// });
//RESTFUL ROUTES
//ROOT ROUTE GENERALLY LEADS TO HOMEPAGE == INDEX PAGE FOR MOST WEBSITES HENCE REDIRECT.
app.get("/", function(req, res){
  res.redirect("/blogs");
});
//INDEX ROUTE
app.get("/blogs", function(req, res){
  Blog.find({}, function(err, blogs){
    if(err){
      console.log(err);
    }
    else{
      res.render("index", {blogs : blogs});
    }
  });
});
//NEW ROUTE
app.get("/blogs/new", function(req,res){
  res.render("new");
});
//CREATE ROUTE
app.post("/blogs", function(req, res){
  req.body.blog.body = sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog){
    if(err){
      console.log(err);
    }else{
      res.redirect("/blogs");
    }
  });
})
//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
        res.redirect("/blogs");
    } else{
      res.render("show", {blog : foundBlog});
    }
  });
});
//EDIT ROUTES
app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
        console.log(err);
    } else{
      res.render("edit", {blog : foundBlog});
    }
  });
})
//UPDATE ROUTES
app.put("/blogs/:id", function(req, res){
  req.body.blog.body = sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err){
        console.log(err);
    } else{
      res.redirect("/blogs/"+req.params.id);
    }
  });
});
//DELETE ROUTES
app.delete("/blogs/:id", function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/blogs");
    }
  });
});

app.listen(3000, function(){
  console.log("BlogApp serving now...");
});
