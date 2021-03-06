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

var db = firebase.database();

var storageRef = firebase.storage().ref();
var imagesRef = storageRef.child('images');

var google = new firebase.auth.GoogleAuthProvider();
var facebook = new firebase.auth.FacebookAuthProvider();

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {

		if (user.displayName === '' && user.providerId === 'firebase') {
			console.log(user);
			return;
		}

		// setUserLocationKey();
		newSetUserLocationKey();

		var displayName = user.displayName,
		    id = user.uid,
		    email = user.email,
		    photoURL = user.photoURL,
		    existingSetting = getUserAutosaveSetting(id),
		    currentLocation = getUserLocation(id);
		// console.log(user);

		existingSetting.then(function (result) {
			createUser(id, displayName, result);
			$('#switch_autosave').prop('checked', result);
		});

		currentLocation.then(function (result) {
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
	var data = {
		templateID: templateID,
		content: template
	};

	return db.ref("Template/" + templateID).update(data).then(function () {
		return console.log("successfully upload template " + templateID);
	}).catch(function (err) {
		return console.log("Error when uploading template " + templateID, err);
	});
}

function getTemplate(templateID) {
	return db.ref("Template/" + templateID).once('value').then(function (snapshot) {
		return snapshot.val();
	}).catch(function (err) {
		return console.log("Error when getting template " + templateID, err);
	});
}

function getUserAutosaveSetting(userID) {
	return db.ref("Users/" + userID).once('value').then(function (data) {
		if (data) return data.val()['autosave'];else return 1;
	}).catch(function (err) {
		return console.log("Couldn't fetch user data: " + err);
	});
}

function loginGoogle() {
	firebase.auth().signInWithRedirect(google).then(function (result) {
		return result.user;
	}).then(function (user) {
		return createUser(user.uid, user.displayName);
	}).catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		var email = error.email;

		console.log("Cannot Login: " + email + " - " + errorCode + ": " + errorMessage);
	});
}

function loginFB() {
	firebase.auth().signInWithRedirect(facebook).catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		var email = error.email;

		console.log("Cannot Login: " + email + " - " + errorCode + ": " + errorMessage);
	});
}

function signUpWithEmail(email, psd, fname, lname) {
	firebase.auth().createUserWithEmailAndPassword(email, psd).then(function (newUser) {
		return newUser.updateProfile({
			displayName: fname + " " + lname,
			autosave: 1
		});
	}).then(function () {
		var newUser = firebase.auth().currentUser;
		console.log(newUser.displayName);
		createUser(newUser.uid, newUser.displayName, 1);
		getLocation();
		buildUserProfile(newUser);

		$('.login-wrapper').hide();
		$('.main').css('opacity', 1);
	}).catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;

		console.log("Cannot sign up: " + errorCode + ": " + errorMessage);
	});
}

function signInWithEmail(email, psd) {
	firebase.auth().signInWithEmailAndPassword(email, psd).then(function (user) {
		return console.log('sign in with email - user:', user);
	}).catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		var email = error.email;

		console.log("Cannot Login with email: " + email + " - " + errorCode + ": " + errorMessage);
	});
}

function logout() {
	return firebase.auth().signOut().then(function () {
		console.log('log out successful');
	}).catch(function (error) {
		console.log("Error when logging out: " + error);
	});
}

function getCurrentUserID() {
	return firebase.auth().currentUser.uid;
}

function isAuthenticated() {
	return firebase.auth().currentUser !== null;
}

function createUser(userID, username, autosave) {
	var id = userID,
	    name = username,
	    as = autosave ? autosave : 1;

	if (name) return db.ref("Users/" + userID).update({
		id: id,
		'username': name,
		autosave: as
	}).then(function () {
		console.log('successfully create user at database');
		loginSuccess();
	}, function (err) {
		console.log("Error when creating user: " + err);
	});
}

function updateUserLocation(userID, location) {
	var date = moment().format('YYYYMMDDHHmmss');

	return db.ref("UserLocation/" + userID).update({
		id: userID,
		city: location.city,
		country: location.country,
		updateDate: date
	}).then(function () {
		return console.log('successfully update user location');
	}, function (err) {
		return console.log("Error when updating user location: " + err);
	});
}

function getUserLocation(userID) {
	return db.ref("UserLocation/" + userID).once('value').then(function (data) {
		return data.val();
	}).catch(function (err) {
		return console.log("Error when getting user loation from database: " + err);
	});
}

function saveContent(saveContentObj) {
	var today = moment(),
	    todayStr = today.format('YYYYMMDD'),
	    now = today.format('HHmmss'),
	    timestamp = today.unix(),
	    updates = {};
	// let newPostKey = db.ref().child('updates').push().key;

	var userID = saveContentObj.id,
	    username = saveContentObj.username,
	    template = saveContentObj.template,
	    contents = saveContentObj.contents,
	    autoSave = saveContentObj.autoSave || 0;
	//name = saveContentObj.saveName || `${todayStr}${now}`;

	var data = {
		id: userID,
		username: username,
		uploadDate: todayStr,
		uploadTime: now,
		template: template,
		contents: contents,
		autoSave: autoSave
	};

	if (saveContentObj.saveName) {
		data['saveName'] = saveContentObj.saveName;
	}

	// updates[`/Updates/${timestamp}`] = data;
	if (autoSave) {
		updates["/Users/" + userID + "/histories/autosave/" + todayStr + now] = data;
	} else {
		// when user manually saves, we can delete all the autosave data
		deleteAutosave(userID);
		updates["/Users/" + userID + "/histories/" + todayStr + "/" + timestamp] = data;
	}

	return db.ref().update(updates).then(function () {
		console.log('Successfully saved contents to database!');
		return saveContentSuccess();
	}, function (err) {
		console.log('Error when saving contents:', err);
	});
}

function getCurrAutosaveNum(userID) {
	var userRef = db.ref("/Users/" + userID + "/histories/autosave");

	return userRef.once('value').then(function (snapshot) {
		if (snapshot.val()) return snapshot.val();else return {};
	}).then(function (data) {
		return Object.keys(data).length;
	}).catch(function (err) {
		return console.log("Error when getting current autosave record number: " + err);
	});
}

function getUserHistory(userID) {
	// list comes back in a ascending order: old to new
	var userRef = db.ref("/Users/" + userID).orderByKey();

	return userRef.once('value').then(function (snapshot) {
		return snapshot.val();
	}).then(function (data) {
		if (data['autosave']) displayHistories(data['histories']);else displayHistories(data['histories'], 'disable');
	}).catch(function (err) {
		return console.log('Error when retrieving data:', err);
	});
}

function updateImgAttr(url) {
	if ($('.thumb.img-cropping').length > 0) {
		$('.thumb.img-cropping').find('img').attr('img-url', url);
	} else if ($('.thumb.active').length > 0) {
		$('.thumb.active').find('img').attr('img-url', url);
	} else if ($('.thumb.uploadingFromFiles').length > 0) {
		$('.thumb.uploadingFromFiles').find('img').attr('src', url).attr('img-url', url);
	}

	$('.thumb.img-cropping').removeClass('img-cropping').find('.crop-btns').remove();
	$('.thumb.active').removeClass('active');
	$('.thumb.uploadingFromFiles .progress-bar-wrapper').remove();
	$('.thumb.uploadingFromFiles').removeClass('uploadingFromFiles');
}

function deleteUserHistory(userID, dataID, date) {
	var dataRef = db.ref("Users/" + userID + "/histories/" + date + "/" + dataID);

	return dataRef.remove().then(function () {
		console.log('Successfully delete history.');
		removeHistoryCard(dataID);
	}).catch(function (err) {
		console.log('Error when deleting history:', err);
	});
}

function deleteAutosave(userID, dataID) {
	var dataRef = db.ref("Users/" + userID + "/histories/autosave"),
	    removePromise = void 0;

	if (!dataID) {
		removePromise = dataRef.remove();
	}

	return removePromise.then(function () {
		return console.log('Successfully delete autosave');
	}).catch(function (err) {
		return console.log("Error when deleting autosave data: " + err);
	});
}

function deleteOldestRecord(userID, type) {
	var id = userID || firebase.auth().currentUser.uid,
	    dataType = type || 'histories',
	    oldestDataRef = db.ref("Users/" + userID + "/histories/autosave");

	return oldestDataRef.remove().then(function () {
		return console.log('successfully removed the oldest autosaved data');
	}).catch(function (err) {
		return console.log(err);
	});
}

function uploadImg(data) {
	var imgName = moment().unix(),
	    userID = getCurrentUserID(),
	    imgRef = storageRef.child("images/" + userID + "/" + imgName),
	    imgTask = imgRef.putString(data, 'base64');

	imgTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
		uploadProgress(snapshot);
	}, function (error) {
		console.error(error);
	});

	return imgTask.then(function (snapshot) {
		//console.log('upload function:', snapshot.metadata.downloadURLs[0]);
		updateImgAttr(snapshot.metadata.downloadURLs[0]);
		return true;
	}).catch(function (err) {
		console.log("Error when uploading image: " + err);
	});
}

function uploadProgress(snapshot) {
	var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100,
	    $imgContainer = $('.input.thumb.uploadingFromFiles').length > 0 ? $('.input.thumb.uploadingFromFiles') : $('.input.thumb.active'),
	    $progressBar = $imgContainer.find('.progress-bar div');

	$progressBar.css('width', progress + "%");
	console.log("Upload is " + progress + "% done");

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
	var fileName = file.name,
	    imgRef = storageRef.child("images/" + userID + "/" + fileName + file.lastModified),
	    imgTask = imgRef.put(file);

	imgTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
		uploadProgress(snapshot);
	}, function (error) {
		console.error(error);
	});

	return imgTask.then(function (snapshot) {
		updateImgAttr(snapshot.metadata.downloadURLs[0]);
		return true;
	}).catch(function (err) {
		console.log("Error when uploading image from files: " + err);
	});
}

function setAutosave(userID, autosave) {
	if (!userID) return;

	var checked = autosave ? 1 : 0;

	return db.ref("Users/" + userID).update({
		autosave: checked
	}).then(function () {
		console.log('successfully changed the setting of autosave');
		loginSuccess();
	}, function (err) {
		console.log("Error when changing autosave setting: " + err);
	});
}