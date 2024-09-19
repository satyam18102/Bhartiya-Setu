const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./model/user.js")



app.set("viewengine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")))


// const mongo_url="mongodb://127.0.0.1:27017/sanskritiSetu";
const mongo_url="mongodb+srv://satyamsinha341:2qmJvaSFLoGXq4Al@cluster0.3ubgp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"



const store=MongoStore.create({
    mongoUrl:mongo_url,
    crypto:{
        secret:"habfakfwkudgaf",
    },
    touchAfter:24*60*60
})



const sessionOptions={
    store,
    secret:"secretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true,
    },
}



app.get("/",(req,res)=>{
    res.redirect("/home")
})

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curstat=req.user;
    next();
})

async function main(){
    await mongoose.connect(mongo_url)
}

main() .then(()=>{
    console.log("Connected to DB")
})
.catch(()=>{
    console.log("Connection Failed");
})


app.get("/home",(req,res)=>{
    res.render("../views/home.ejs")
})



app.post("/signup",async (req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser=new User({email,username});
        await User.register(newUser,password);
        req.flash("success","User registered successfully")
        res.redirect("/home");
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup")
    }
});

app.get("/login",(req,res)=>{
    res.render("../views/login.ejs")
})
app.get("/signup",(req,res)=>{
    res.render("../views/signup.ejs")
})


app.post("/login",passport.authenticate("local",{failureRedirect:"/admin/login",failureFlash:true}),async(req,res)=>{
    let {username}=req.body;
    req.flash("success",`Welcome back ${username}`);
    let redirectUrl=res.locals.redirectUrl||"/home"
    res.redirect(redirectUrl);
})
app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success",`Logged out successfully`);
        res.redirect("/home")
    })
})


app.get("/map",(req,res)=>{
    res.render("../views/map2.ejs")
})
app.get("/map/go",(req,res)=>{
    res.render("../views/map.ejs")
})
app.get("/blank",(req,res)=>{
    res.render("../views/blank.ejs")
})

app.listen(3232,()=>{
    console.log("Serer started on Port:3232")
})
