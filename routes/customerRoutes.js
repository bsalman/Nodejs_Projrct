const express = require('express')
const dataModule = require('../modules/mongooseDataModule')
const customerRoutes= express.Router()
customerRoutes.use((req,res,next)=>{
    if(req.session.user){
       next()
    }else{
        res.render('/login')
    }
})
customerRoutes.get('/',(req,res)=>{
    res.render('shopLogout',{email:req.session.user.email})
    // 
})



module.exports = customerRoutes