//================== Require area===============================//
const express = require('express')
const session = require('express-session')


const adminRouter = require('./routes/adminRoutes')
const customerRoutes=require('./routes/customerRoutes')
const emailSender = require('./modules/emailSender')
const fileupload = require('express-fileupload')
const cookie = require('cookie-parser')
const fs = require('fs')

const dataModule = require('./modules/mongooseDataModule')
const app = express()

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({extended: false}))
app.use(express.json())
const sessionOptions = {
    secret: 'Fashi | Template',
    cookie: {}
}
app.use(session(sessionOptions))
app.use(cookie())
app.use(fileupload({
    limits: { fileSize: 50 * 1024 * 1024 }
}))

app.use('/admin', adminRouter)
//app.use('/shopLogout',customerRoutes)

//======================== end Require area====================================//
//======================== Routs area=====================================//
// to add parameter to ejs to use it  in ejs files


app.get('/', (req, res)=>{
res.render('index',{login: req.session.user})


});

//==========================//
app.get('/contact',(req,res)=>{
    res.render('contact',{login: req.session.user,send:1})
})
app.post('/contact',(req,res)=>{
    console.log(req.body);
    const name = req.body.name
    const email = req.body.email
    const message = req.body.message
    if(name != "" && name.length < 100 ){
        emailSender.sendEmail(name, email,message, (ok) => {
            if(ok){
                res.json(1)
            } else{
                res.json(2)
            }
        });
    }
})
//=======================shop ============================//
app.get('/shop',(req,res)=>{
    dataModule.getAllProducts().then( products => {
        res.render('shop', {login: req.session.user, products: products})
    }).catch(error => {
        res.send(error);
    })

})

//==================== register===========================//
app.get('/register',(req,res)=>{
if (req.session.user){
    res.redirect('/')
} else {
    res.render('register', {login: req.session.user})
}
})
app.post('/register',(req,res)=>{
    
    // console.log(req.body);
    const name=req.body.name.trim();
    const email=req.body.email.trim();
    const password =req.body.password;
    const rePassword= req.body.password;
    if(name&&email&&password&&password==rePassword){
        dataModule.registerCustomer(name,email,password).then(()=>{
            res.json(1)
        }).catch((error)=>{
            console.log(error);
            if (error=='exist') {
                res.json(3)
            }else{
                res.json(4)
            }
        })
    }else{
        res.json(2)
    }

})

//======================== login================================//
//1=success or exist 
//2= missing entry
//3=not exist
//4=server problem
app.get('/login',(req,res)=>{
// console.log(req.session);
     if (req.session.user){
         res.redirect('/')
     } else {
          res.render('login', {login: req.session.user})
     }
  
})
//=============================================//
// app.get('/category/:cat', (req, res) => {
//     const category = req.params.cat
//     res.send(category)
// })
//=================================================//

app.post('/login',(req,res)=>{
    // console.log(req.body);
    const logInEmail= req.body.email.trim();
    const logInPassword= req.body.password.trim();

    if(logInEmail&& logInPassword){
        dataModule.checkCustomer(logInEmail, logInPassword).then((customer)=>{

            req.session.user = customer
            if (customer.role === "Admin"){
                res.json(1)
            } else {
                if (customer.role === "Customer") {
                     res.json(5)
                }
               
            }
            req.session.user = customer
             if(customer.role==="admin"){
                 res.json(5)
             }else if(customer.role==="customer"){res.json(1)}
})
       .catch((error)=>{
           if (error==3) {
               res.json(3)
           }else{
            res.json(4)
           }
       })
   }else{
    res.json(2)
   }

    
})


//=================== logout====================//
app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/login')
})
// ================== show product page===============//
app.get('/showproduct/:id',(req,res)=>{
    dataModule.getProduct(req.params.id).then(product =>{
        res.render('showproduct',{login:req.session.user, products: product})
    }).catch(error => {
        res.send(error);
    })
})
//==================shopping_card page================//
app.get('/shoppingcard',(req,res)=>{

    res.render('shoppingcard',{login:req.session.user})
})
//===============================================//
app.get('/shop',(req,res)=>{
    dataModule.getAllProducts().then( products => {
        res.render('shop', {login: req.session.user, products: products})
    }).catch(error => {
        res.send(error);
    })
})

//=========================Filter=========================//

app.post("/searchResult", (req,res)=>{
    const categories =req.body.categories;
    const minPrice =req.body.minPrice;
    const maxPrice =req.body.maxPrice;
    const color = req.body.color;
    const size = req.body.size;
    const name =req.body.name
    dataModule.filter(categories,parseInt(minPrice.replace('$', '')) ,parseInt(maxPrice.replace('$', '')) ,color,size,name).then(results=>{
        //res.render('shop',{login:req.session.user,products:results})
        res.json(results)
    }).catch(error=>{ res.json(2)
    console.log(error);
})
    console.log(req.body)
    //res.json(req.body)
})



//========================end  Routs area=====================================//

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
