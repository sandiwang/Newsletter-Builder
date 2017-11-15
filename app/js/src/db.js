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

let google = new firebase.auth.GoogleAuthProvider();
let facebook = new firebase.auth.FacebookAuthProvider();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    let displayName = user.displayName,
    		id = user.uid,
        email = user.email,
        photoURL = user.photoURL;
    console.log(user);
    
    $('.login-wrapper').hide();
  	$('.main').css('opacity', 1);
  	
  	buildUserProfile(user);
  	createUser(id, displayName);
  } else {
    $('.login-wrapper').show();
    console.log('logged out');
  }
});

function loginGoogle() {
	firebase.auth().signInWithRedirect(google)
	.then((result) => result.user)
	.then((user) => createUser(user.uid, user.displayName))
	.catch((error) => {
	  let errorCode = error.code;
	  let errorMessage = error.message;
	  let email = error.email;

	  console.log(`Cannot Login: ${email} - ${errorCode}: ${errorMessage}`);
	});
}

function loginFB() {
	firebase.auth().signInWithRedirect(facebook)
	.catch((error) => {
	  let errorCode = error.code;
	  let errorMessage = error.message;
	  let email = error.email;

	  console.log(`Cannot Login: ${email} - ${errorCode}: ${errorMessage}`);
	});
}

function logout() {
	firebase.auth().signOut().then(() => {
	  console.log('log out successful');
	}).catch(function(error) {
	  console.log(`Error when logging out: ${error}`);
	});
}

function getCurrentUserID() {
	return firebase.auth().currentUser.uid;
}

function createUser(userId, username) {
	return db.ref(`Users/${userId}`).update({
		id: userId,
		username
	}).then(() => {
		console.log('successfully create user at database');
		loginSuccess();
	}, (err) => {
		console.log(`Error when creating user: ${err}`);
	});
}

function saveContent(userId, username, template, contents, autoSave) {
	let today = moment(),
			todayStr = today.format('YYYYMMDD'),
			now = today.format('HHmmss'),
			timestamp = today.unix(),
			updates = {};
	// let newPostKey = db.ref().child('updates').push().key;

	let data = {
		id: userId,
		username,
		uploadDate: todayStr,
		uploadTime: now,
		template,
		contents,
		autoSave: autoSave || 0
	}

	// updates[`/Updates/${timestamp}`] = data;
	if(autoSave) {
		updates[`/Users/${userId}/histories/autosave/${todayStr}${now}`] = data;
	} else {
		// when user manually saves, we can delete all the autosave data
		deleteAutosave(userId);
		updates[`/Users/${userId}/histories/${todayStr}/${timestamp}`] = data;
	}

	return db.ref().update(updates).then(() => {
		console.log('Successfully saved contents to database!');
		return saveContentSuccess();
	}, (err) => {
		console.log('Error when saving contents:', err);
	});	
}

function getCurrAutosaveNum(userID) {
	let userRef = db.ref(`/Users/${userID}/histories/autosave`);

	return userRef.once('value')
		.then((snapshot) => {
			if(snapshot.val()) return snapshot.val();
			else return {};
		})
		.then((data) => Object.keys(data).length)
		.catch((err) => console.log(`Error when getting current autosave record number: ${err}`));
}

function getUserHistory(userID) {
	// list comes back in a ascending order: old to new
	let userRef = db.ref(`/Users/${userID}/histories`).orderByKey();

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

function deleteUserHistory(userID, dataID, date) {
	let dataRef = db.ref(`Users/${userID}/histories/${date}/${dataID}`);

	return dataRef.remove()
		.then(() => {
			console.log('Successfully delete history.')
			removeHistoryCard(dataID);
		})
		.catch((err) => {
			console.log('Error when deleting history:', err);
		});
}

function deleteAutosave(userID, dataID) {
	let dataRef = db.ref(`Users/${userID}/histories/autosave`),
			removePromise;

	if(!dataID) {
		removePromise = dataRef.remove();
	}

	return removePromise
		.then(() => console.log('Successfully delete autosave'))
		.catch((err) => console.log(`Error when deleting autosave data: ${err}`));
}

function deleteOldestRecord(userID, type) {
	let id = userID || firebase.auth().currentUser.uid,
			dataType = type || 'histories',
			oldestDataRef = db.ref(`Users/${userID}/histories/autosave`);

	return oldestDataRef
		.remove()
		.then(() => console.log('successfully removed the oldest autosaved data'))
		.catch((err) => console.log(err));
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

	return imgRef.putString(data, 'base64')
		.then((snapshot) => {
			//console.log('upload function:', snapshot.metadata.downloadURLs[0]);
			updateImgSrc(snapshot.metadata.downloadURLs[0]);
			return true;
		})
		.catch((err) => {
			console.log(`Error when uploading iamge: ${err}`);
		});
}