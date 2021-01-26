const express = require("express");
const mongoose = require("mongoose");

const dotenv = require("dotenv");

const path = require('path')
const User = require('./models/userModel');
const hbs = require('hbs');
const Blogpost = require('./models/blogpostModel');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');

let authenticated = false;

const app = express();
dotenv.config({ path:'./.env' });

mongoose.connect( process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( () => console.log("MongoDB is connected"));

const viewsPath = path.join(__dirname, '/views');
const publicDirectory = path.join(__dirname, '/public');

const partialPath = path.join(__dirname, '/views/incParsels');

hbs.registerPartials(partialPath);

app.set('views', viewsPath);
app.set('view engine', 'hbs');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended: false}));
app.use(express.json({extended: false}));
app.use(cookieParser());

app.get('/', async (req, res ) => { 

    const allPosts = await Blogpost.aggregate([{$sample:{size:4}}])
    ///........render blog post and user info to the page..
    console.log(allPosts)
    
    res.render('index',{
        allPosts:allPosts
    });
});


app.get('/register', (req, res ) => { 
    res.render('register');
});

app.post('/register', async (req, res) => {
    console.log(req.body);
    // confirmPassword:req.body.confirmPassword
    const hashedPassword = await bcrypt.hash(req.body.userPassword, 8)
    const user = await User.find({ email: req.body.userEmail })
    const password1 = req.body.userPassword;
    const password2 = req.body.passwordConfirm

    if (password1 !== password2) {
        const errorMessage = "ERROR PASSWORDS DO NOT MATCH";

        res.render('register', {
            errorMessage: errorMessage
        })
    } else if (user.length > 0) {
        const errorMessage = "EMAIL ALREADY EXIST";

        res.render('register', {
            errorMessage: errorMessage
        })
    } else {

        await User.create({
            name: req.body.userName,
            email: req.body.userEmail,
            password: hashedPassword
        })
        res.render("login");
    }
}
);

app.get("/login", (req, res)=> {
    res.render("login")

})

// app.post("/login", auth.isLoggedIn, async (req, res) => {

//     const user = await User.findOne({ email: req.body.userEmail });

//     const isMatch = await bcrypt.compare(req.body.userPassword, user.password)
//     console.log(user.admin)
//     if (isMatch) {




//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//             expiresIn: process.env.JWT_EXPIRES_IN
//         });

//         console.log(token)

//         const cookieOptions = {
//             expires: new Date(
//                 Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
//             ),
//             httpOnly: true

//         }

//         res.cookie('jwt', token, cookieOptions)

//         if (user.admin) {

//             res.render('adminProfile', {
//                 user: user,
//                 id: user._id
//             })

//         } else {

//             res.render('profile', {
//                  user: user,
//                 id: user._id
//             })
//         }


//     } else {
//         const errorMessage = "Details are wrong";

//         res.render('login', {
//             message: errorMessage
//         })
//     }

// })


app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.userEmail });
    console.log("data below coming from login")
    console.log(user)
    const isMatch = await bcrypt.compare(req.body.userPassword, user.password);
    if (isMatch) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        console.log(token);
        const cookieOption = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };
        res.cookie("jwt", token, cookieOption);
        res.redirect("/profile");
    } else {
        res.send("Login Detail Incorrect");
    }
});



app.get("/profile", auth.isLoggedIn, async (req, res) => {
   
   
    if (req.userFound && req.userFound.admin) {
        const userDB = req.userFound; 
        
        console.log(req.userFound)
        res.render("adminProfile",{
            
            user: userDB,
           
          

            
            
        })
    } else if (req.userFound) {
        const userDB = req.userFound; 
        console.log(userDB);
        res.render("profile", {
          
            user: userDB,
            
           
        });
    } else {
        res.redirect("login");
    }
});




app.get("/allUsers", (req, res)=> {
res.render("allUsers")

})

app.post('/allUsers', async (req, res) => {

        
        const usersDB = await User.find({})
    
        console.log(usersDB)
        res.render('allUsers',{ 
            
            users:usersDB 
        })
       
})

app.post("/delete/:id", auth.isLoggedIn, async (req, res) => {
    // const userId = req.userFound._id//...double check this
    if (req.userFound.admin) {
  

    await Blogpost.deleteMany({userid: req.params.id})    
    await User.findByIdAndDelete( req.params.id);
}
    res.send("its been deleted")
    // {
    //     userId:userId//.....double check this
    // });
    // });
});


app.post("/deleteUsersPost/:id", auth.isLoggedIn, async (req, res) => {

    if(req.userFound.admin){

    await Blogpost.findByIdAndDelete(req.params.id)

    }
    res.send("post has been deleted")

})




app.get('/usersDetails/:id',auth.isLoggedIn, async (req,res) => {

    const userId = await User.findById(req.params.id)



    res.render("allUsersUpdate",{ 
        userId:userId
    })

})




app.post("/allUsersUpdate/:id", auth.isLoggedIn, async (req, res) => {
    
    const userId = req.params.id
    if (req.userFound.admin) {
  
        await User.findByIdAndUpdate(userId , {
            name: req.body.userName,
            email: req.body.userEmail,
           
        });
        }


        res.send("its been updated")
       
})



app.get('/allUsersPosts', auth.isLoggedIn, async (req,res) => {
    
    const userId = req.userFound._id
    const id = await User.findById(userId)
    const allusersPosts = await Blogpost.find({ userId: req.params.id })
  
    console.log(allusersPosts)

    res.render("allUsersPosts",  {
    allPosts:allusersPosts
    })
    
})







app.get('/update', auth.isLoggedIn, async (req,res) => {
    const userId = req.userFound._id
    const id = await User.findById(userId)
    res.render("update")

})

app.post("/updateUser", auth.isLoggedIn, async (req, res) => {

    const userId = req.userFound._id
    const id = await User.findById(userId)

    const isMatch = await bcrypt.compare(req.body.userPassword, id.password)
    console.log(req.body.userPassword)
    console.log(id.password)

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 8)

    if (isMatch == false) {
        await User.findByIdAndUpdate(userId, {
            name: req.body.userName,
            email: req.body.userEmail,
            password: hashedPassword
        });
        const message = "profile updated";

        res.render('update', {

            message: message
        })

    } else {

        const message = "password are incorrect"
        res.render("update", {
            message: message
        })
    }


}

);

    


app.get('/newPost', auth.isLoggedIn, async (req,res) => {
    
    const userId = req.userFound._id
    const id = await User.findById(userId)


    res.render('newPost') 
    
    
})

app.post('/blogpost',  auth.isLoggedIn, async (req,res) => {

    const userId = req.userFound._id
    const id = await User.findById(userId)


   
    await Blogpost.create({
        
        title: req.body.postTitle,
        body: req.body.postBody,
        userid: userId,
        
    });
   const message = "blog updated"
   res.render("allPosts", {
    message:message,
   })
      
   
})


app.get('/allPosts', auth.isLoggedIn, async (req,res) => {//.....rendering all blog post for all users
    
    console.log(req.userFound)
    const allPosts = await Blogpost.find({ userid:req.userFound })
    let firstObject = allPosts[0]
    console.log(allPosts)

    res.render("allPosts",  {
    allPosts:allPosts,
    firstObject:firstObject
    })
    
    
})




app.get('/updatePost', auth.isLoggedIn, async(req,res) =>{

    
    const updatePost = await Blogpost.find({ userid:req.userFound._id })
    // console.log(req.Blogpost._id)

    res.render('updatePost', {
        updatePost:updatePost
    }) 

})

app.post("/changePost/:id", auth.isLoggedIn, async (req, res) => {

    const userId = req.userFound._id    

    if(req.userFound) {
    await Blogpost.findByIdAndUpdate(req.params.id, {
        title: req.body.postTitle,
        body: req.body.postBody,
        userid: userId,
    });
    }
    res.send("blog updated")
    
    })



  //.....delete blog route needs creating and installing  



app.post("/delete", auth.isLoggedIn, async (req,res) =>{//......render homepage with message

    await User.findByIdAndDelete(req.userFound._id);

    const message = "profile DELETED";

    res.render('index', {
        
        message:message
    })

})


app.get("/logout", auth.logout, (req,res) => {

    const message = "see you again soon";

    res.render("index",{
        message:message
    })



  }) 


app.listen(5500, () => {
    console.log("server running on port 5000")
})






    
    
