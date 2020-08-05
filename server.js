const express = require('express');
const Firebase = require("firebase");
var bcrypt = require('bcryptjs');
var bodyParser = require("body-parser");
const path = require('path');
const app = express();

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(bodyParser.json());

const firebaseConfig = require("./firebaseuser.json");

let appfirebase = Firebase.initializeApp(firebaseConfig);
const db = appfirebase.firestore();

app.post("/", (req,res) => {
    try{
        var userEmail = null;
        var emaillowercase = req.body.email.toLowerCase();

        db.collection("/User").get().then(snapshot =>{
            snapshot.docs.forEach(doc =>{
                if(doc.data().email === emaillowercase){
                    userEmail = doc.data().email;
                }
            })
        }).then(() => {
            if(userEmail !== null){
                Firebase.auth().signInWithEmailAndPassword(userEmail, req.body.password).then(() =>{
                    let response = {
                        uid: Firebase.auth().currentUser.uid,
                        success: true
                    }
                    res.json(response);
                }).catch(() => {
                    let response = {
                        uid: null,
                        success: false
                    }
                    res.json(response);
                })
            }else{
                let response = {
                    uid: null,
                    success: false
                }
                res.json(response);
            }
        })
    }catch(error){
        let response = {
            uid: null,
            success: false
        }
        res.json(response);
    }
})

app.post("/Signup", async (req,res) => {
    try{
        var emaillowercase = req.body.email.toLowerCase();
        var userExist = {
            emailExist: false
        };
        db.collection("/User").get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                if(doc.data().email === emaillowercase){
                    userExist.emailExist = true;
                }
            })
        }).then(async () =>{
            if(userExist.emailExist === false){
                var salt = await bcrypt.genSalt();
                var hashedPassword = await bcrypt.hash(req.body.password , salt);
                Firebase.auth().createUserWithEmailAndPassword(emaillowercase, req.body.password).then(user => {
                    db.collection("/User").doc(user.user.uid).set({
                        email: emaillowercase,
                        password: hashedPassword
                    });
                    response = {
                        uid: user.user.uid,
                        success: true
                    }
                    res.json(response);
                }).catch(() => {
                    let response = {
                        uid: null,
                        success: false
                    }
                    res.json(response);
                })
            }else{
                let response = {
                    uid: null,
                    success: false,
                    emailError: userExist.emailExist
                }
                res.json(response);
            }
        })
    }catch(error){
        let response = {
            uid: null,
            success: false,
        }
        res.json(response);
    }
})

app.post("/ForgotPassword", (req,res) => {
    try{
        const emaillowercase = req.body.email.toLowerCase();
        var emailExist = false;
        db.collection("/User").get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                if(doc.data().email === emaillowercase){
                    emailExist = true;
                }
            })
        }).then(() => {
                if(emailExist === true){
                    Firebase.auth().sendPasswordResetEmail(emaillowercase).then(() => {
                        let response = {
                            success: true
                        }
                        res.json(response);
                    })
                }else{
                    let response = {
                        success: false
                    }
                    res.json(response);
                }
            })
    }catch(error){
        let response = {
            success: false
        }
        res.json(response);
    }
})

app.post("/VerifyUser", (req,res) => {
    var docRef = db.collection("/User").doc(req.body.uid);
    docRef.get().then(doc => {
        if(doc.exists){
            let response = {
                success: true
            }
            res.json(response);
        }else{
            let response = {
                success: false
            }
            res.json(response);
        }
    }).catch(() => {
        let response = {
            success: false
        }
        res.json(response);
    })
})

app.post("/User/AddItem", (req,res) => {
    try{
        let docref = db.collection("/User").doc(req.body.uid);
        docref.get().then(doc => {
            if(doc.exists){
                var d = new Date();
                db.collection("/Item").doc().set({
                    userID: req.body.uid,
                    title: req.body.title,
                    date: d
                }).then(() => {
                    let response = {
                        success: true
                    }
                    res.json(response);
                }).catch(() => {
                    let response = {
                        success: false
                    }
                    res.json(response);
                })
            }else{
                let response = {
                    success: false
                }
                res.json(response);
            }
        })
    }catch(error){
        let response = {
            success: false
        }
        res.json(response);
    }
})

app.post("/User/DeleteItem", (req,res) => {
    try{
        let docref = db.collection("/User").doc(req.body.uid);
        docref.get().then(doc => {
            if(doc.exists){
                let docref = db.collection("/Item").doc(req.body.itemID);
                docref.get().then(async (doc) => {
                    if(doc.exists){
                        if(doc.data().userID === req.body.uid){
                            db.collection("/Item").doc(req.body.itemID).delete().then(function() {
                                let response = {
                                    success: true
                                }
                                res.json(response);
                            }).catch(() => {
                                let response = {
                                    success: false
                                }
                                res.json(response);
                            })
                        }
                    }else{
                        let response = {
                            success: false
                        }
                        res.json(response);
                    }
                })
            }else{
                let response = {
                    success: false
                }
                res.json(response);
            }
        })
    }catch(error){
        let response = {
            success: false
        }
        res.json(response);
    }
})

app.post("/User/EditItem", (req,res) => {
    try{
        let docref = db.collection("/User").doc(req.body.uid);
        docref.get().then(doc => {
            if(doc.exists){
                let docref = db.collection("/Item").doc(req.body.itemID);
                docref.get().then(async (doc) => {
                    if(doc.exists){
                        if(doc.data().userID === req.body.uid){
                            var d = new Date();
                            db.collection("/Item").doc(req.body.itemID).set({
                                userID: req.body.uid,
                                title: req.body.title,
                                date: d
                            }).then(() => {
                                let response = {
                                    success: true
                                }
                                res.json(response);
                            }).catch(() => {
                                let response = {
                                    success: false
                                }
                                res.json(response);
                            })
                        }
                    }else{
                        let response = {
                            success: false
                        }
                        res.json(response);
                    }
                })
            }else{
                let response = {
                    success: false
                }
                res.json(response);
            }
        })
    }catch(error){
        let response = {
            success: false
        }
        res.json(response);
    }
})

app.post("/User/Items", (req,res) => {
    try{
        var nowDate = new Date();
        var lista = [];

        var docRef = db.collection("/User").doc(req.body.uid);
        docRef.get().then(doc => {
            if(doc.exists){
                db.collection("/Item").get().then(snapshot =>{
                    snapshot.docs.forEach(doc =>{
                        if(doc.data().userID === req.body.uid){
                            var koha = 0;
                            var docDate = doc.data().date.toDate();
                            var result = timeDifference(nowDate, docDate);

                            if(result.years >= 1){
                                koha = result.years + " years ago";
                            }
                            if(result.months >= 1 && koha === 0){
                                koha = result.months + " months ago";
                            }
                            if(result.weeks >= 1 && koha === 0){
                                koha = result.weeks + " weeks ago";
                            }
                            if(result.days >= 1 && koha === 0){
                                koha = result.days + " days ago";
                            }
                            if(result.hours >= 1 && koha === 0){
                                koha = result.hours + " hours ago";
                            }
                            if(result.minutes >= 1 && koha === 0){
                                koha = result.minutes + " minutes ago";
                            }
                            if(koha === 0){
                                koha = "Just now";
                            }

                            var resultDate;
                            var month = docDate.getMonth() + 1;
                            var day = docDate.getDate();
                            var year = docDate.getFullYear();

                            if(month < 10){
                                month = "0" + month;
                            }
                            if(day < 10){
                                day = "0" + day;
                            }
                            resultDate = month + "/" + day + "/" + year;
                            var item = {
                                itemID: doc.id,
                                title: doc.data().title,
                                lastmod: resultDate,
                                howlong: koha
                            }
                            var fromDate;
                            var toDate;

                            if(req.body.from !== undefined){
                                var tempfrom = new Date(req.body.from);
                                fromDate = tempfrom.getTime();
                            }else{
                                fromDate = 0;
                            }
                            if(req.body.to !== undefined){
                                var tempto = new Date(req.body.to);
                                toDate = tempto.getTime();
                            }else{
                                toDate = 999999999999999 + 999999999999999;
                            }
                            if(docDate.getTime() >= fromDate && docDate.getTime() <= toDate){
                                lista.push(item);
                            }
                        }
                    })
                }).then(() => {
                    let response = {
                        success: true,
                        lista: lista
                    }
                    res.json(response);
                }).catch(() => {
                    let response = {
                        success: false
                    }
                    res.json(response);
                })
            }else{
                let response = {
                    success: false
                }
                res.json(response);
            }
        })
    }catch(error){
        let response = {
            success: false
        }
        res.json(response);
    }
})

const timeDifference = (date1,date2) => {
    var yearsDifference = date1.getFullYear() - date2.getFullYear();

    var monthsDifference = date1.getMonth() - date2.getMonth();

    var daysDifference = date1.getDate() - date2.getDate();

    var weeksDifference = daysDifference / 7;

    var hoursDifference = date1.getHours() - date2.getHours();

    var minutesDifference = date1.getMinutes() - date2.getMinutes();

    var result = {
        years: yearsDifference,
        months: monthsDifference,
        weeks: weeksDifference,
        days: daysDifference,
        hours: hoursDifference,
        minutes: minutesDifference,
    }
    return result;
}

app.route('/*').get(function(req, res) { 
    return res.sendFile(path.join(__dirname, '../frontend/build/index.html')); 
});

app.listen(process.env.PORT || 3000);