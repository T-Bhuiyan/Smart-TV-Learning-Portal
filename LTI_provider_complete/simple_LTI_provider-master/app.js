console.log("Starting server")

/*

Shared secret & consumer key is for Authentification
after authentification, POST parameter is for content retrieval
--------------------------------
LTI POST parameter (Required)
--------------------------------
lti_message_type    = basic-lti-launch-request
lti_version         = LTI-1p0
resource_link_id    = the content unique ID
oauth_consumer_key  = the token

*/

var     express     = require("express");
var     app         = express();
var     mongoose    = require("mongoose");
var     bodyParser  = require("body-parser");
const   jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var     cors        = require('cors')
//const   port        = 3000

// Enable all Cors request
app.use(cors())

// set ejs engine
app.set("view engine", "ejs");
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//set static file for assets (for css and other thing)
app.use(express.static(__dirname + "/assets"));

// connect to database
//mongoose.connect("mongodb://localhost:27017/lti", { useNewUrlParser: true });
mongoose.connect("mongodb://gie:123asd@ds233320.mlab.com:33320/lti", { useNewUrlParser: true });

// ---------- Create schema (data structure) & model to call-----------
// User schema & model
var userSchema = new mongoose.Schema({
    name:       String,
    email:      String,
    password:   String
});

var User = mongoose.model("User", userSchema);

// Video schema & model
var videoSchema = new mongoose.Schema({
    name:       String,
    link:       String
});

var Video = mongoose.model("Video", videoSchema);

// Quiz schema & model
var quizSchema = new mongoose.Schema({
    question:   String,
    opt1:       String,
    opt2:       String,
    opt3:       String,
    opt4:       String,
    answer:     String
});

var Quiz = mongoose.model("Quiz", quizSchema);

// Answer history schema & model
var historySchema = new mongoose.Schema({

    name:       String,
    answer:     String,
    number:     String
});

var History = mongoose.model("History", historySchema);



// ---------------------------------------------------------------------------------------
// The routing activity
// ---------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------
// Main route
app.get("/", function(req, res){
    res.render("regLog.ejs");
});

// ---------------------------------------------------------------------------------------
// Sign up
app.post("/sign_up", function(req, res) {

    // Assign the parameter to the userdata data structure
    var userData = new User({
        name      :req.body.username,
        email     :req.body.email,
        password  :req.body.password
    });
    
    // Save the data to database
    userData.save( function(err, response){
        if(err){
            console.log("hmm looks like error");
            console.log(err)
        } else {
            console.log("ok, saved")
            console.log(response)
        }
    })
    
    return res.render("regLog.ejs");
});


// ---------------------------------------------------------------------------------------
// LTI Request
// send lti post request with lti compliance format

app.post("/lti_request", function(req, res) {


    var reqLti_message_type         = req.body.lti_message_type;
    var reqLti_version              = req.body.lti_version;
    var reqResource_link_id         = req.body.resource_link_id;
    var reqOauth_consumer_key       = req.body.oauth_consumer_key ;
    
    var ltiRequestValidation        = false;

    var contentType                 = reqResource_link_id.charAt(0);
    var contentIdentifier           = reqResource_link_id.substring(1, reqResource_link_id.length)

    if(reqLti_message_type != "basic-lti-launch-request" && reqLti_version != "LTI-1p0"){
        errorMessage = "Not an LTI request";
        return res.json({ "content": errorMessage});
    }
    // -----------------------------------------------------------------------------------------
    // reqResource_link_id => first character for content type , second is the content id
    // video is 0 , quizz is 1   . then add the content name/number
    // example = 0smile => video content + smile 
    // example = 11  => quizz content + quizz number 1
    // -----------------------------------------------------------------------------------------

    jwt.verify(reqOauth_consumer_key, "lti_SecretKey", function(err, decoded) {
        console.log(contentType); // bar

        if(err){
            return res.json({ "content": "Forbidden"});
        } else{
            ltiRequestValidation = true;
        }
        // return res.render("errorPage.ejs", {errorMessage: decoded.tokenPayload.pass})
    });

    if(ltiRequestValidation == true){

        if(contentType == "0"){
                Video.findOne({name:contentIdentifier}, function(searchErr, searchRes){
                
                    // if error
                    if(searchErr){
                        console.log("hmm looks like error");
                        console.log(searchErr);
                        return res.json({ "content": searchErr});
                    } 
            
                    // if nothing found
                    if (searchRes == null) {
                        errorMessage = "video not found.";
                        console.log(errorMessage);
                        return res.json({ "content": errorMessage});
                    }
            
                    if (searchRes.name == contentIdentifier) {
                        return res.json({ "content": searchRes.link});
                    }    
            
            
                });
        } else {

                    Quiz.findOne({number:parseInt(contentIdentifier)}, function(searchErr, searchRes){
                        
                        if(searchErr){
                            console.log("hmm looks like error");
                            console.log(searchErr);
                            return res.json({ "quiz": searchErr});
                        } else if(searchRes == null) {
                            errorMessage = "quizz not found.";
                            console.log(errorMessage);
                            return res.json({ "quiz": errorMessage});
                        } else {
                            return res.send({searchRes});
                        }    
                    });
        }

    }
});

// ---------------------------------------------------------------------------------------
// Login
// Find user in db, create token, send back json 

app.post("/login", function(req, res) {


    var reqPass     = req.body.password_login;

    // login validation process
    User.findOne({password:reqPass}, function(searchErr, searchRes){
        

        // if error
        if(searchErr){
            console.log("hmm looks like error");
            console.log(searchErr);
            return res.json({ "key": searchErr});
        } 

        // if nothing found
        if (searchRes == null) {
            errorMessage = "Authentication failed. User not found.";
            console.log(errorMessage);
            return res.json({ "key": errorMessage});
        }
               
        // if found......bad logic but ok....
        if (searchRes.password == reqPass) {
            
            // login validation succes
            loginResult = true;
            
            const tokenPayload  = {
                name: searchRes.name,
                pass: reqPass
            };
            const token         = jwt.sign({tokenPayload}, "lti_SecretKey");

            return res.json({ "key": token});
            
        }    

    });



});

// ---------------------------------------------------------------------------------------
// History
// multi user functionality. save user activity
app.post("/History", function(req, res) {

    // Assign the parameter to the userdata data structure
    var userHistory = new History({
        name        :req.body.name,
        answer      :req.body.answer,
        number      :req.body.number
    });

    // add answer history to database
    userHistory.save( function(err, response){
        if(err){
            console.log("hmm looks like error");
            console.log(err)
            return res.json({ "status": err});
        } else {
            console.log("ok, saved")
            console.log(response)
            return res.json({ "status": "Saved"});
        }
    })
});

app.get("/History", function(req, res) {
    // add answer history to database
    History.find({}, function(err, response){
        if(err){
            console.log("hmm looks like error");
            console.log(err)
            return res.json({ "history": err});
        } else {
            console.log(response)
            return res.json({ "history": response});
        }
    })
});

// ----------------------------------------------------------------------
// Test route
app.get("/test", function(req, res){
    var videoLink                   = "https://www.youtube.com/embed/PMIqlIJNkRA?autoplay=1";
    return res.json({ "videoLink": videoLink});
});

app.post("/test", function(req, res){
    var reqVidName     = req.body.vidName;
    
    Video.findOne({name:reqVidName}, function(searchErr, searchRes){
        
        // if error
        if(searchErr){
            console.log("hmm looks like error");
            console.log(searchErr);
            return res.json({ "link": searchErr});
        } 

        // if nothing found
        if (searchRes == null) {
            errorMessage = "video not found.";
            console.log(errorMessage);
            return res.json({ "link": errorMessage});
        }

        if (searchRes.name == reqVidName) {
            return res.json({ "link": searchRes.link});
        }    


    });

});

app.post("/test/quiz", function(req, res){
    
    var reqQuestionNumber   = parseInt(req.body.questionNumber);

    console.log(reqQuestionNumber);
    Quiz.findOne({number:reqQuestionNumber}, function(searchErr, searchRes){
        console.log(searchRes);
        if(searchErr){
            console.log("hmm looks like error");
            console.log(searchErr);
            return res.json({ "quiz": searchErr});
        } else if(searchRes == null) {
            errorMessage = "video not found.";
            console.log(errorMessage);
            return res.json({ "quiz": errorMessage});
        } else {
            return res.send({searchRes});
        }    

    });

});

app.post("/test/video", function(req, res){
    var reqVidName      = req.body.vidName;
    var videoLink       = requestVideo(reqVidName);
    console.log(videoLink);
    return res.json({ "content": videoLink});
});

// ----------------------------------------------------------------------
// The function


// app.listen(port, '192.168.52.128', () => console.log(`Server at port: ${port}!`))
// app.listen(port, () => console.log(`Server at port: ${port}!`))


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, process.env.IP, () => console.log(`Server at port: ${port}!`) );