var express = require('express');
	router = express.Router(),
	fs = require('fs'),
	path = require('path'),
	multer = require('multer'),
	upload = multer(),
	request = require('request'); // for parsing multipart/form-data

router.post('/', upload.array(), function (req, res, next) {
	//1.获取客户端传来的src_str字符串=>判断是base64还是普通地址=>获取图片类型后缀(jpg/png etc)
	//=>如果是base64替换掉"前缀"("data:image\/png;base64," etc) 
	//2.base64 转为 buffer对象  普通地址则先down下来
	//3.写入硬盘(后续可以将地址存入数据库)
	//4.返回picture地址
	var src_str = req.body.image,
		timestamp = new Date().getTime();
	if ( src_str.match(/^data:image\/png;base64,|^data:image\/jpg;base64,|^data:image\/jpg;base64,|^data:image\/bmp;base64,/) ) {
		//处理截图 src_str为base64字符串
		var pic_suffix = src_str.split(';',1)[0].split('/',2)[1],
			base64 = src_str.replace(/^data:image\/png;base64,|^data:image\/jpg;base64,|^data:image\/jpg;base64,|^data:image\/bmp;base64,/, ''),
			buf = new Buffer(base64, 'base64'),
			store_path = 'public/images/test_' + timestamp + '.' + pic_suffix;

		fs.writeFile(store_path, buf, function (err) {
			if (err) {
				throw err;
			} else {
				res.json({'store_path': store_path});
			}
		});
	} else {// 处理非chrome的网页图片 src_str为图片地址
		var temp_array = src_str.split('.'),
			pic_suffix = temp_array[temp_array.length - 1],
			store_path = 'public/images/test_' + timestamp + '.' + pic_suffix,
			wstream = fs.createWriteStream(store_path);

		request(src_str).pipe(wstream);
		wstream.on('finish', function (err) {
			if( err ) {
				throw err;
			} else {
				res.json({"store_path": store_path});
			}
		});
	}
});

module.exports = router;