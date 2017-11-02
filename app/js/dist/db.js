"use strict";

/***** example to get download link of a image *****/
//const piglet = storageRef.child('images/piglet.png');
//piglet.getDownloadURL().then((url) => {
//	console.log(url);
//});

// Initialize Firebase
var FirebaseConfig = {
	apiKey: "AIzaSyBlvNBOhRw5A1CrLod8UDwVZywpo5u3onU",
	authDomain: "gensler-newsletter.firebaseapp.com",
	databaseURL: "https://gensler-newsletter.firebaseio.com",
	projectId: "gensler-newsletter",
	storageBucket: "gensler-newsletter.appspot.com",
	messagingSenderId: "988677837144"
};

firebase.initializeApp(FirebaseConfig);

var storageRef = firebase.storage().ref();
var imagesRef = storageRef.child('images');

function updateImgSrc(url) {
	if ($('.thumb.img-cropping').length > 0) {
		$('.thumb.img-cropping').find('img').attr('img-url', url);
	} else if ($('.thumb.active').length > 0) {
		$('.thumb.active').find('img').attr('img-url', url);
	}

	$('.thumb.img-cropping').removeClass('img-cropping').find('.crop-btns').remove();
	return $('.thumb.active').removeClass('active');
}

function uploadImg(data) {
	var imgName = Date.now();
	var imgRef = storageRef.child('images/' + imgName);

	/***** TODO: add progress bar *****/
	/*
 let imgTask = imgRef.putString(data, 'base64');
 
 imgTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
 	const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  	console.log(`Upload is ${progress}% done`);
 
  	switch (snapshot.state) {
     case firebase.storage.TaskState.SUCCESS: // or 'success'
       console.log('Upload is complete');
       break;
     case firebase.storage.TaskState.RUNNING: // or 'running'
       console.log('Upload is running');
       break;
     default:
       console.log(snapshot.state);
   }
 }, (error) => {
 	console.error(error);
 }, () => {
 	updateImgSrc(imgTask.snapshot.downloadUrl);
 });
 */

	return imgRef.putString(data, 'base64').then(function (snapshot) {
		//console.log('upload function:', snapshot.metadata.downloadURLs[0]);
		updateImgSrc(snapshot.metadata.downloadURLs[0]);
	});
}