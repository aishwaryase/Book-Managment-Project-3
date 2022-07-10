const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
 

// validate phone number 
const isValidPhone = (phone) => {
    let regEx = /^(\+\d{1,3}[- ]?)?\d{10}$/
    return regEx.test(phone)
}

//create user details
const createUser = async function (req, res) {
    try {
        const data = req.body
    
        let obj={}
        let { title, name, phone, email, password, address} = data //destructure
        
        if(address !== undefined){
            obj.address={};

            if(address.street !== undefined){
                
                obj.address.street = address.street.trim().split(" ").filter(word=>word).join(" ")
            }
            if(address.pincode != undefined){
                if(!/^[0-9]{6}$/.test(address.pincode)){
                    return res.status(400).send({ status: false, message: "pincode length must be 6 and contains number" })
                }
        
                obj.address.pincode = address.pincode.trim()
            }
            if(address.city != undefined){
                obj.address.city = address.city.trim().split(" ").filter(word=>word).join(" ")
            }
        }
    
        //check data is exist | key exist in data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Data is required to add a user" })
        }

        //check title is present 
        if (!title || !title.trim()) {
            return res.status(400).send({ status: false, message: "title is required" })
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
         if (!name || !name.trim()) {
            return res.status(400).send({ status: false, message: "Name is required" })
        }

        //validate name
        if (!/^([a-zA-Z. , ]){1,100}$/.test(name)) {
            return res.status(400).send({ status: false, message: `name contain only alphabets` })

        }
        //check phone is present
        if (!phone || !phone.trim()) {
            return res.status(400).send({ status: false, message: "user's phone  is required" })
        }

        //validate phone
        if (!isValidPhone(phone.trim())) {
            return res.status(400).send({ status: false, message: "mobile phone is not valid" })
        }
         //check uniqueness of phone
         if (await userModel.findOne({ phone: phone }))
         return res.status(400).send({status:false, message: "Phone already exist" })

       //check email is present
        if (!email || !email.trim()) {
            return res.status(400).send({ status: false, message: "user's email  is required" })
        }

        //check uniqueness of email
        if (await userModel.findOne({ email: email }))
            return res.status(400).send({status:false, message: "Email already exist" })

        
        //validate email
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }
        //check password is present
        if (!password || !password.trim()) {
            return res.status(400).send({ status: false, message: "user's password  is required" })
        }
        
        //password validation
        if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) {
            return res.status(400).send({ status: false, message: `password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter` })
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
     let userName = req.body.email;
     let password = req.body.password;
     
     //email is required
     if(!userName) return res.status(400).send({status:false,message:"user Email is required"})
     
     //password is required
     if(!password) return res.status(400).send({status:false,message:"user password is required"})
     
     //email and password check from db
     let user = await userModel.findOne({ email: userName, password: password });
     if (!user)
         return res.status(401).send({ status: false, message: "email or the password is not correct" });
 
    
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