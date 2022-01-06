const express = require('express');
const app = express();
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;

const methodOverride = require('method-override') // PUT(수정) 요청 가능
app.use(methodOverride('_method'))                //

app.set('view engine', 'ejs')

app.use('/public', express.static('public')) // static 파일을 보관하기 위해 public 폴더를 쓴다.

var db;
MongoClient.connect('mongodb+srv://admin:1234@cluster0.vosbs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(에러, client){
    if (에러) return console.log(에러)
    db = client.db('todoapp');  // db연결

    app.listen(8080, function(){
        console.log('listening on 8080');
    });
})



app.get('/', function(req, res){
    res.render('index.ejs', );
})

app.get('/write', function(req, res){
    res.render('write.ejs', );
})

app.post('/add', function(req, res){ // 폼에서 /add로 post 요청
    res.send('전송완료'); 
    db.collection('counter').findOne({name : '게시물개수'}, function(에러, 결과){ // db.counter 내의 게시물개수를 찾음
        console.log(결과.totalPost)
        var 총게시물개수 = 결과.totalPost // 총개시물개수를 변수에 저장

        // db.post 내에 /add 폼에서 받아온 id, title, date 내용을 추가한다.
        db.collection('post').insertOne({_id : 총게시물개수 + 1, 제목 : req.body.title, 날짜 : req.body.date}, function(){
            db.collection('counter').updateOne({name:'게시물개수'}, {$inc : {totalPost:1}}, function(에러, 결과){
                if(에러){return console.log(에러)}
                res.send('전송완료');
            })
        })
    })
})


//list로 get요청으로 접속
app.get('/list', function(req, res){
// db에 저장된 post라는 collection 안의 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        res.render('list.ejs', {posts : 결과});
    });
});

// /delete로 delete요청 
app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    //req.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(req.body, function(에러, 결과){
        console.log('삭제완료');
        res.status(200).send({message:'성공했습니다.'});
    })
})

// detail:id로 접속 요청하면 detail:id를 가져와보여줌
app.get('/detail/:id', function(req, res){ 
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(에러, 결과){ // db에서 post를 찾아 _id인 요소 
        console.log(결과);
        res.render('detail.ejs', { data : 결과 });
    })
})

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(에러, 결과){
        console.log(결과)
        res.render('edit.ejs', {post : 결과})
    })
})

app.put('/edit', function(req, res){
    db.collection('post').updateOne(
        {_id : parseInt(req.body.id)}, {$set : {제목 : req.body.title, 날짜 : req.body.date}}, function(에러, 결과){
        console.log('수정완료');
        res.redirect('/list');
    })
})