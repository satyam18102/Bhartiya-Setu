const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");


app.set("viewengine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")))


app.get("/",(req,res)=>{
    res.render("../views/home.ejs")
})
app.get("/home",(req,res)=>{
    res.render("../views/home.ejs")
})
app.get("/login",(req,res)=>{
    res.render("../views/login.ejs")
})
app.get("/signup",(req,res)=>{
    res.render("../views/signup.ejs")
})
app.get("/map",(req,res)=>{
    res.render("../views/map2.ejs")
})
app.get("/map/go",(req,res)=>{
    res.render("../views/map.ejs")
})

app.listen(3232,()=>{
    console.log("Serer started on Port:3232")
})
