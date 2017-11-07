/***** example to get download link of a image *****/
//const piglet = storageRef.child('images/piglet.png');
//piglet.getDownloadURL().then((url) => {
//	console.log(url);
//});

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

let db = firebase.database();

let storageRef = firebase.storage().ref();
let imagesRef = storageRef.child('images');

function getCurrentUserID() {
	return Cookies.getJSON().name.userID;
}

function createUser(userId, username) {
	db.ref(`Users/${userId}`).set({
		id: userId,
		username
	}).then(() => {
		console.log('successfully create user at database');
		loginSuccess();
	}, (err) => {
		console.log(`Error: ${err}`);
	});
}

function saveContent(userId, username, template, contents) {
	let today = moment(),
			todayStr = today.format('YYYYMMDD'),
			now = today.format('HHmmss'),
			timestamp = today.unix();
	// let newPostKey = db.ref().child('updates').push().key;

	let data = {
		id: userId,
		username,
		uploadDate: todayStr,
		uploadTime: now,
		template,
		contents
	}

	let updates = {};
	updates[`/Updates/${timestamp}`] = data;
	updates[`/Users/${userId}/histories/${todayStr}/${timestamp}`] = data;

	return db.ref().update(updates).then(() => {
		console.log('Successfully saved contents to database!');
		return saveContentSuccess();
	}, (err) => {
		console.log('Error:', err);
	});	
}

function getUserHistory(userId) {
	// list comes back in a ascending order: old to new
	let userRef = db.ref(`/Users/${userId}/histories`).orderByKey();

	return userRef
					.once('value')
					.then((snapshot) => snapshot.val(), 
								(err) => conosle.log('Error when retrieving data:', err))
					.then((data) => displayHistories(data));
}

function updateImgSrc(url) {
	if($('.thumb.img-cropping').length > 0) {
		$('.thumb.img-cropping').find('img').attr('img-url', url);
	} else if ($('.thumb.active').length > 0) {
		$('.thumb.active').find('img').attr('img-url', url);
	}
	
	$('.thumb.img-cropping').removeClass('img-cropping').find('.crop-btns').remove();
	return $('.thumb.active').removeClass('active');
}

function uploadImg(data) {
	let imgName = moment().unix(),
			userID = getCurrentUserID();
	let imgRef = storageRef.child(`images/${userID}/${imgName}`);
	
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