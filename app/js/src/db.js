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

  	if(user.displayName === '' && user.providerId === 'firebase') {
  		console.log(user);
  		return;
  	}

    let displayName = user.displayName,
    		id = user.uid,
        email = user.email,
        photoURL = user.photoURL,
        existingSetting = getUserAutosaveSetting(id),
        currentLocation = getUserLocation(id);
   // console.log(user);

    existingSetting.then((result) => {
			createUser(id, displayName, result);
			$('#switch_autosave').prop('checked', result);
  	});

    currentLocation.then((result) => {
    	$('#user-profile-modal .user-location').html(result.city);
    });

    buildUserProfile(user);
    
    $('.login-wrapper').hide();
  	$('.main').css('opacity', 1);
  } else {
    $('.login-wrapper').show();
    console.log('logged out');
  }
});

function uploadTemplate(templateID, template) {
	let data = {
		templateID,
		content: template
	};

	return db.ref(`Template/${templateID}`)
		.update(data)
		.then(() => console.log(`successfully upload template ${templateID}`))
		.catch((err) => console.log(`Error when uploading template ${templateID}`, err));
}

function getTemplate(templateID) {
	return db.ref(`Template/${templateID}`)
		.once('value')
		.then((snapshot) => snapshot.val())
		.catch((err) => console.log(`Error when getting template ${templateID}`, err));
}

function getUserAutosaveSetting(userID) {
	return db.ref(`Users/${userID}`)
		.once('value')
		.then((data) => {
			if(data) return data.val()['autosave'];
			else return 1;
		})
		.catch((err) => console.log(`Couldn't fetch user data: ${err}`));
}

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

function signUpWithEmail(email, psd, fname, lname) {
	firebase.auth().createUserWithEmailAndPassword(email, psd)
	.then((newUser) => newUser.updateProfile({
		displayName: `${fname} ${lname}`,
		autosave: 1
	}))
	.then(() => {
		let newUser = firebase.auth().currentUser;
		console.log(newUser.displayName);
		createUser(newUser.uid, newUser.displayName, 1);
		getLocation();
		buildUserProfile(newUser);

		$('.login-wrapper').hide();
  	$('.main').css('opacity', 1);
	})
	.catch((error) => {
		let errorCode = error.code;
	  let errorMessage = error.message;

	  console.log(`Cannot sign up: ${errorCode}: ${errorMessage}`);
	});
}

function signInWithEmail(email, psd) {
	firebase.auth().signInWithEmailAndPassword(email, psd)
		.then((user) => console.log('sign in with email - user:', user))
		.catch((error) => {
			let errorCode = error.code;
		  let errorMessage = error.message;
		  let email = error.email;

		  console.log(`Cannot Login with email: ${email} - ${errorCode}: ${errorMessage}`);
		})
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

function isAuthenticated() {
	return firebase.auth().currentUser !== null
}

function createUser(userID, username, autosave) {
	let id = userID,
			name = username,
			as = autosave ? autosave : 1;

	if(name) 
	return db.ref(`Users/${userID}`).update({
		id,
		'username': name,
		autosave: as
	}).then(() => {
		console.log('successfully create user at database');
		loginSuccess();
	}, (err) => {
		console.log(`Error when creating user: ${err}`);
	});
}

function updateUserLocation(userID, location) {
	let date = moment().format('YYYYMMDDHHmmss');

	return db.ref(`UserLocation/${userID}`).update({
		id: userID,
		city: location.city,
		country: location.country,
		updateDate: date
	}).then(() => console.log('successfully update user location'),
					(err) => console.log(`Error when updating user location: ${err}`));
}

function getUserLocation(userID) {
	return db.ref(`UserLocation/${userID}`)
		.once('value')
		.then((data) => data.val())
		.catch((err) => console.log(`Error when getting user loation from database: ${err}`));
}

function saveContent(userID, username, template, contents, autoSave) {
	let today = moment(),
			todayStr = today.format('YYYYMMDD'),
			now = today.format('HHmmss'),
			timestamp = today.unix(),
			updates = {};
	// let newPostKey = db.ref().child('updates').push().key;

	let data = {
		id: userID,
		username,
		uploadDate: todayStr,
		uploadTime: now,
		template,
		contents,
		autoSave: autoSave || 0
	}

	// updates[`/Updates/${timestamp}`] = data;
	if(autoSave) {
		updates[`/Users/${userID}/histories/autosave/${todayStr}${now}`] = data;
	} else {
		// when user manually saves, we can delete all the autosave data
		deleteAutosave(userID);
		updates[`/Users/${userID}/histories/${todayStr}/${timestamp}`] = data;
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
	let userRef = db.ref(`/Users/${userID}`).orderByKey();

	return userRef
		.once('value')
		.then((snapshot) => snapshot.val())
		.then((data) => {
			if(data['autosave']) displayHistories(data['histories']);
			else displayHistories(data['histories'], 'disable');
		})
		.catch((err) => console.log('Error when retrieving data:', err));
}

function updateImgAttr(url) {
	if($('.thumb.img-cropping').length > 0) {
		$('.thumb.img-cropping').find('img').attr('img-url', url);
	} else if ($('.thumb.active').length > 0) {
		$('.thumb.active').find('img').attr('img-url', url);
	} else if($('.thumb.uploadingFromFiles').length > 0) {
		$('.thumb.uploadingFromFiles').find('img').attr('src', url).attr('img-url', url);
	}
	
	$('.thumb.img-cropping').removeClass('img-cropping').find('.crop-btns').remove();
	$('.thumb.active').removeClass('active');
	$('.thumb.uploadingFromFiles .progress-bar-wrapper').remove();
	$('.thumb.uploadingFromFiles').removeClass('uploadingFromFiles');
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
			userID = getCurrentUserID(),
			imgRef = storageRef.child(`images/${userID}/${imgName}`),
			imgTask = imgRef.putString(data, 'base64');
	
	imgTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
		uploadProgress(snapshot);
	}, (error) => {
		console.error(error);
	});

	return imgTask
		.then((snapshot) => {
			//console.log('upload function:', snapshot.metadata.downloadURLs[0]);
			updateImgAttr(snapshot.metadata.downloadURLs[0]);
			return true;
		})
		.catch((err) => {
			console.log(`Error when uploading image: ${err}`);
		});
}

function uploadProgress(snapshot) {
	const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
				$imgContainer = $('.input.thumb.uploadingFromFiles').length > 0 ? $('.input.thumb.uploadingFromFiles') : $('.input.thumb.active'),
				$progressBar = $imgContainer.find('.progress-bar div');

	$progressBar.css('width', `${progress}%`);
	console.log(`Upload is ${progress}% done`);

	/*
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
  */
}

function uploadImgFromFiles(userID, file) {
	let fileName = file.name,
			imgRef = storageRef.child(`images/${userID}/${fileName}${file.lastModified}`),
			imgTask = imgRef.put(file);

	imgTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
		uploadProgress(snapshot);
	}, (error) => {
		console.error(error);
	});

	return imgTask
		.then((snapshot) => {
			updateImgAttr(snapshot.metadata.downloadURLs[0]);
			return true;
		})
		.catch((err) => {
			console.log(`Error when uploading image from files: ${err}`);
		})
}

function setAutosave(userID, autosave) {
	if(!userID) return;

	let checked = autosave ? 1 : 0;

	return db.ref(`Users/${userID}`).update({
		autosave: checked,
	}).then(() => {
		console.log('successfully changed the setting of autosave');
		loginSuccess();
	}, (err) => {
		console.log(`Error when changing autosave setting: ${err}`);
	});
}