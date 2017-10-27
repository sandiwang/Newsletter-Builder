// Initialize Firebase
let FirebaseConfig = {
  apiKey: "AIzaSyBlvNBOhRw5A1CrLod8UDwVZywpo5u3onU",
  authDomain: "gensler-newsletter.firebaseapp.com",
  databaseURL: "https://gensler-newsletter.firebaseio.com",
  projectId: "gensler-newsletter",
  storageBucket: "gensler-newsletter.appspot.com",
  messagingSenderId: "988677837144"
};

firebase.initializeApp(FirebaseConfig);

let storageRef = firebase.storage().ref();
let imagesRef = storageRef.child('images');

function updateImgSrc(url) {
	//console.log('update function:', url);
	$('.thumb.active').find('img').attr('src', url);
	return $('.thumb.active').removeClass('active');
}

function uploadImg(data) {
	let imgName = Date.now();
	let imgRef = storageRef.child('images/' + imgName);
	
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

	return imgRef.putString(data, 'base64').then((snapshot) => {
		//console.log('upload function:', snapshot.metadata.downloadURLs[0]);
		updateImgSrc(snapshot.metadata.downloadURLs[0]);
	});
}