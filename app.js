const words = require("word-list-json");
const express = require("express");
const cookieParse = require('cookie-parser');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(cookieParse());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true,
}));

const port= process.env.PORT || "3000";

const SECERET_JWT_KEY="&Ou388df'^8.~.t^n#gd_TPOgEm~J&~T.}-XA)?}A~r7c8+{L;Wq{!N8e>iSq>G";
const allWords=words.filter((word)=>{
    if(word.length==5){
        return word;
    }
});

app.listen(port,()=>{
    console.log("listening on port 3000...");
})


//jwt creation function
const maxAge= 24 * 60 * 60 ;

const createJWT=(letter)=>{
    return jwt.sign({ letter },SECERET_JWT_KEY,{
        expiresIn:maxAge,
    })
}

//END

//jwt decrypt
const decodeJWT=(token)=>{
    if(token){
        return jwt.verify(token,SECERET_JWT_KEY,(err,decodedToken)=>{
            // console.log("decoded: ",decodedToken['letter']);
            return decodedToken['letter'];
        })
    }
}
//END

//get randon word from word-list-json

let propWord="";

const createWord=()=>{
    const randonIndex = Math.floor(Math.random()*allWords.length);

    const word = allWords[randonIndex];
    console.log(word);
    return word;
}

//END

app.get("/",(req,res)=>{    
    
    if(!req.cookies['jwt']){
        
        const jwtToken=createJWT(createWord());
        const turns=createJWT(0);

        res.cookie('jwt',jwtToken,{ httpOnly:true });
        res.cookie('turn',turns,{ httpOnly:true });
    }
    res.render("index"); 
})

app.post("/checkword",(req,res)=>{
    const word  = req.body['word'];
    const cookieTurn = decodeJWT(req.cookies['turn']);
    if( word.length == 5){
        console.log(cookieTurn);
        if(cookieTurn < 5){
            
            const decodedJWT=decodeJWT(req.cookies['jwt']).toUpperCase();

            if(word == decodedJWT){
                res.send({status:'won'});
            }
            else{
                let state={};
                let i=0;

                for( i ; i<5 ; i++ ){
                    if( decodedJWT.includes(word[i]) ){
                        state[i]=1;
                    }
                    else{
                        state[i]=0;
                    }
                    if( decodedJWT[i] == word[i] ){
                        state[i]=2;
                    }
                }
                
                const turns=createJWT(cookieTurn+1);
                res.cookie('turn',turns,{ httpOnly:true });
                
                console.log(state);
                res.send({status:'continue',state});
            }

        }
        else{
            const decodedJWT=decodeJWT(req.cookies['jwt']).toUpperCase();
            propWord=decodedJWT;
            res.send({status:"lost",word:decodedJWT});
        }
        // console.log(decodedJWT);
    }
    //console.log(word);
})

app.get("/newWord",(req,res)=>{
    const jwtToken=createJWT(createWord());
    const turns=createJWT(0);

    res.cookie('jwt',jwtToken,{ httpOnly:true });
    res.cookie('turn',turns,{ httpOnly:true });

    res.redirect('/');
})

// app.get("/test",async(req,res)=>{
//     let data;
//     let jData="{";
//     fs.readFile('words.json',(err,file)=>{
//         jData+=file;
//         jData+="}";
//     });
//     console.log(jData);
// })