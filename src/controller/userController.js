const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
 


//create user details
const createUser = async function (req, res) {
    try {
        const data = req.body
        let obj={}
        
        let { title, name, phone, email, password, address} = data //destructure
        
    
        //check data is exist | key exist in data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Data is required to add a user" })
        }

        //check title is present 
       
        if(!title ||typeof title !=='string' || title.trim().length==0 )
        {
            return res.status(400).send({ status: false, msg: "title is required and is of string type" })
        }

        //validate title enum
        const isvalid=function(title){
            return["Mr","Mrs","Miss"].indexOf(title)=== -1
            
        }

        //check enum
        if (isvalid(title)){
            return res.status(400).send({status: false, message:"title shoud be one of Mr, Mrs, Miss"})
        }

         //check name is present 
         if(!name ||typeof name !=='string' || name.trim().length==0 )
         {
            return res.status(400).send({ status: false, message: "Name is required and of string type only" })
        }

        //validate name
        if (!/^([a-zA-Z. , ]){1,100}$/.test(name)) {
            return res.status(400).send({ status: false, message: `name contain only alphabets` })

        }
        //check phone is present
        if(!phone ||typeof phone !=='string' || phone.trim().length==0 ) {
            return res.status(400).send({ status: false, message: "user's phone  is required" })
        }

        //validate phone
        if (!/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/.test(phone)) {
            return res.status(400).send({ status: false, message: "mobile phone is not valid" })
        }
         //check uniqueness of phone
         if (await userModel.findOne({ phone: phone }))
         return res.status(400).send({ message: "Phone already exist" })

       //check email is present
        if (!email ||typeof email !=='string' || email.trim().length==0) {
            return res.status(400).send({ status: false, message: "user's email  is required and of string type only" })
        }

        //check uniqueness of email
        if (await userModel.findOne({ email: email }))
            return res.status(400).send({ message: "Email already exist" })

        
        //validate email
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }
        //check password is present
        if (!password ||typeof password !=='string' || password.trim().length==0) {
            return res.status(400).send({ status: false, message: "user's password  is required and of string type only" })
        }
        
        //password validation
        if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) {
            return res.status(400).send({ status: false, message: `password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter` })
        }  

        //address validation
        if(address !== undefined){
            obj.address={};

            if(address.street !== undefined ){
            if( typeof address.street !=='string' || address.street.trim().length ==0 ){
                return res.status(400).send({status:false ,message:"street can not be empty string"})
                
            } obj.address.street = address.street.trim().split(" ").filter(word=>word).join(" ")
        }

           

            if(address.pincode !== undefined ){
                if( typeof address.pincode !=='string' || address.pincode.trim().length ==0 ){
                    return res.status(400).send({status:false ,message:"pincode can not be empty string it contains pincode of 6 digits only"})  
                }
                obj.address.pincode = address.pincode.trim()
            }
            if(!/^[0-9]{6}$/.test(address.pincode)){
                return res.status(400).send({ status: false, msg: "pincode length must be 6 and contains number" })
            }
    
            if(address.city != undefined){
                if(typeof address.city !=='string' || address.city.trim().length==0){
                    return res.status(400).send({status:false, message:"city can not be empty string"})
                }
                obj.address.city = address.city.trim().split(" ").filter(word=>word).join(" ")
            }
        }

         //discard unwanted space between string
         obj.name = data.name.trim().split(" ").filter(word=>word).join(" ")
         obj.title = data.title.trim()
         obj.email = data.email.trim()
         obj.phone = data.phone.trim()
         obj.password = data.password.trim()

        let savedData = await userModel.create(obj)
    
        return res.status(201).send({ status:true, message: 'Success', data: savedData })

    }
    catch (err) {
        res.status(500).send({status:false,  message: err.message })
    }
}


//login and token creation
const loginUser = async function (req, res) {
    try {
    let data=req.body;
     let userName = req.body.email;
     let password = req.body.password;
     
     //check data is exist | key exist in data
     if (Object.keys(data).length == 0) {
        return res.status(400).send({ status: false, msg: "Data is required to login" })
    }

     //email is required
     if(!userName) 
     return res.status(400).send({status:false,message:"user Email is required"})
     
     //password is required
     if(!password)
      return res.status(400).send({status:false,message:"user password is required"})
     
     //email and password check from db
     let user = await userModel.findOne({ email: userName, password: password });
     if (!user)
         return res.status(401).send({ status: false, message: "credentials are not correct" });
 
    
    var d = new Date();
    //calculate exp of 1 hrs.
    var calculatedExpiresIn = (((d.getTime()) + (60 * 60 * 1000))-(d.getTime() - d.getMilliseconds())/1000);
    
     //token created here
        var token = jwt.sign(
            {
                "userId": user._id, 
                "iat": new Date().getTime(),
                "exp": calculatedExpiresIn 
            },
            "ProjectBookMgmt"
                );
     res.setHeader("x-api-key", token);
     return res.status(201).send({ status: true, token: token});
 }
 catch (err) {
     console.log(err.message)
     res.status(500).send({status: false, message: err.message })
 }
     
 };
 
  
 module.exports.createUser = createUser
 module.exports.loginUser = loginUser