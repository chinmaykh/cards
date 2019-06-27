const express = require('express');

const app = express();

app.use(express.static('front_end'));

app.get('/api/sc',(req,res)=>{
    res.sendFile('/front_end/cards!.html');    
})

app.get('/api/cards.html',(req,res)=>{
    res.sendFile('./front_end/cards!.html');
})

app.listen(4000,()=>{
    console.log("Listening on port 4000...")
});
