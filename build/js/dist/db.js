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
		var displayName = user.displayName,
		    id = user.uid,
		    email = user.email,
		    photoURL = user.photoURL,
		    existingSetting = getUserAutosaveSetting(id);
		// console.log(user);

		existingSetting.then(function (result) {
			createUser(id, displayName, result);
			$('#switch_autosave').prop('checked', result);
		});

		buildUserProfile(user);

		$('.login-wrapper').hide();
		$('.main').css('opacity', 1);
	} else {
		$('.login-wrapper').show();
		console.log('logged out');
	}
});

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

function logout() {
	firebase.auth().signOut().then(function () {
		console.log('log out successful');
	}).catch(function (error) {
		console.log("Error when logging out: " + error);
	});
}

function getCurrentUserID() {
	return firebase.auth().currentUser.uid;
}

function createUser(userId, username, autosave) {
	return db.ref("Users/" + userId).update({
		id: userId,
		username: username,
		autosave: autosave
	}).then(function () {
		console.log('successfully create user at database');
		loginSuccess();
	}, function (err) {
		console.log("Error when creating user: " + err);
	});
}

function saveContent(userId, username, template, contents, autoSave) {
	var today = moment(),
	    todayStr = today.format('YYYYMMDD'),
	    now = today.format('HHmmss'),
	    timestamp = today.unix(),
	    updates = {};
	// let newPostKey = db.ref().child('updates').push().key;

	var data = {
		id: userId,
		username: username,
		uploadDate: todayStr,
		uploadTime: now,
		template: template,
		contents: contents,
		autoSave: autoSave || 0

		// updates[`/Updates/${timestamp}`] = data;
	};if (autoSave) {
		updates["/Users/" + userId + "/histories/autosave/" + todayStr + now] = data;
	} else {
		// when user manually saves, we can delete all the autosave data
		deleteAutosave(userId);
		updates["/Users/" + userId + "/histories/" + todayStr + "/" + timestamp] = data;
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

function updateImgSrc(url) {
	if ($('.thumb.img-cropping').length > 0) {
		$('.thumb.img-cropping').find('img').attr('img-url', url);
	} else if ($('.thumb.active').length > 0) {
		$('.thumb.active').find('img').attr('img-url', url);
	}

	$('.thumb.img-cropping').removeClass('img-cropping').find('.crop-btns').remove();
	return $('.thumb.active').removeClass('active');
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
	    userID = getCurrentUserID();
	var imgRef = storageRef.child("images/" + userID + "/" + imgName);

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
		return true;
	}).catch(function (err) {
		console.log("Error when uploading iamge: " + err);
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