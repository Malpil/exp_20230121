var express = require('express');
var router = express.Router();

// 타임 존 설정하기
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 파일첨부 라이브러리 가져오기
var multer = require('multer');
// 파일첨부 후 저장방식 (파일 => 현재 PC에 저장, 메모리=>DB에 저장)
var upload = multer({ storage: multer.memoryStorage() });

//모델 객체
var Bakery = require('../models/bakerymodel');

// 상점등록 => 127.0.0.1:3000/api/bakery/insertshop.json
//{"title":"a", "content":"b", "writer":"c","file":"첨부파일"}
router.post('/insertshop.json', upload.single("file"), async function (req, res, next) {
    try {
      console.log('알이큐', req);
      console.log('바디', req.body);
      console.log('파일', req.file);
  
      const bakery = new Bakery();
      bakery.name = req.body.name;
      bakery.address = req.body.address;
      bakery.addressdetail = req.body.addressdetail;
      bakery.phone = req.body.phone;
      bakery.parking = req.body.parking;
      bakery.menu = req.body.menu;
      bakery.price = req.body.price;
      bakery.holiday = req.body.holiday;
      bakery.point = req.body.point;
      bakery.hit = req.body.hit;
      bakery.bookmarkcount = req.body.bookmarkcount;
      bakery.lat = Number(req.body.lat);
      bakery.lng = Number(req.body.lng);
      bakery.strength = req.body.strength;
      bakery.filedata = req.file.buffer;
      bakery.filename = req.file.originalname;
      bakery.filetype = req.file.mimetype;
      bakery.filesize = req.file.size;
  
      const result = await bakery.save();
  
      if (result !== null) {
        return res.send({ status: 200 });
      } else {
        return res.send({ status: 0 });
      }
    } catch (e) {
      console.error(e);
      return res.send({ status: -1, result: e });
    }
});

//지역별 상점 목록 => 127.0.0.1:3000/api/bakery/selectshop.json?page=1&text=검색어
router.get('/selectshop.json', async function (req, res, next) {
  try {
    const text = req.query.text; //검색어
    const page = req.query.page; //1

    //전체 데이터에서 제목이 검색어가 포함된 것 가져오기
    // a => a123, 
    const query = { address: new RegExp(text, 'i') }; //RegExp(포함된 것을 찾아내는 함수)
    const project = {
      filedata: 0,
      filename: 0,
      filesize: 0,
      filetype: 0,
    };
    const result = await Bakery.find(query, project)
      .sort({ _id: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    //등록일, 이미지URL 수동 생성                          
    for (let tmp of result) {
      //format("YYYY-MM-DD HH:mm:ss")
      tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD");
      tmp.imageurl = `/api/bakery/image?_id=${tmp._id}&ts=${Date.now()}`;
    }

    //페이지네이션용 전체 개수
    const total = await Bakery.countDocuments(query);

    return res.send({ status: 200, total: total, result: result });
  } catch (e) { 
    console.error(e);
    return res.send({ status: -1, result: e });
  }

});

//빵집 한개 조회 => /api/bakery/bakeryoneshop.json?_id=15
router.get('/bakeryoneshop.json', async function (req, res, next) {
  try{
    const no =  Number(req.query._id);
    const query = {_id: no};
    const project = {
      filedata: 0,
      filename: 0,
      filesize: 0,
      filetype: 0,
    };

    const result = await Bakery.findOne(query,project);

    if(result !== null) {
      result.regdate = moment(result.regdate).format("YYYY-MM-DD");
      result.imageurl = `/api/board/imge?_id=${no}&ts=${Date.now()}`;
      
      return res.send({ 
        status: 200,
        result: result,
      });
    }
    return res.send({status : 0});
  } catch(e) {
      console.error(e);
      return res.send({ status: -1, result: e });
    }
});




//이미지 URL => 127.0.0.1:3000/api/bakery/image?_id=3
//<img src="/api/bakery/image?_id=3">
router.get('/image', async function (req, res, next) {
  try {

    const query = { _id: Number(req.query._id) };
    const project = { filedata: 1, filetype: 1 };
    const result = await Bakery.findOne(query, project);
    //console.log(result);

    res.contentType(result.filetype);

    return res.send(result.filedata);

  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
}); 



module.exports = router;