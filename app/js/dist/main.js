'use strict';

/*
let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});
*/

/***** Summernote API ***************/
/***** https://summernote.org/ ******/

var textEditor = {
	height: 300,
	maxHeight: 220,
	toolbar: [
	// [groupName, [list of button]]
	['style', ['bold', 'italic', 'underline']], ['font', ['strikethrough', 'superscript', 'subscript']], ['fontsize', ['fontsize', 'height', 'clear']], ['color', ['color']], ['code', ['codeview']], ['para', ['ul', 'ol', 'paragraph']], ['link', ['link', 'picture']], ['cancel', ['cancel']], ['submit', ['save']]]
};

/***** AccuWeather API *************************/
/***** https://developer.accuweather.com/ ******/

var weatherConfig = {
	key: 'CvzA3RKOLCUuqfAMyao7AFVyqDtrYMW7',
	url: 'http://dataservice.accuweather.com/forecasts/v1/daily/5day',
	locationKeyUrl: 'http://dataservice.accuweather.com/locations/v1/cities/',
	locationKey: {},
	icons: {
		sunny: 'sunny.png',
		partlySunny: 'mostly-sunny.png',
		mostlyCloudy: 'mostly-cloudy.png',
		cloudy: 'cloudy.png',
		fog: 'weather_icon-39.png',
		showers: 'shower.png',
		sunnyShowers: 'sunny-shower.png',
		rain: 'rain.png',
		tStorm: 'tstorm.png',
		flurry: 'snow.png',
		sunnyFlurry: 'snow.png',
		snow: 'snow.png',
		sleet: 'snow.png',
		rainSnow: 'rain-snow.png',
		windy: 'windy.png',
		hot: 'hot.png',
		cold: 'cold.png'
	}
};

/***** ipinfo.io API ***********/
/***** https://ipinfo.io/ ******/

var geolocationConfig = {
	key: '0226b2e6a2a271'
};

var userLocation = {};

var TextEditor = {
	SaveBtn: function SaveBtn(context) {
		var summernoteui = $.summernote.ui;

		var button = summernoteui.button({
			contents: 'SAVE',
			tooltip: 'Save',
			click: function click() {
				updateContent();
				TextEditor.hidePopup();
				$('.input.active').removeClass('active');
				doAutosave();
			}
		});

		return button.render();
	},
	CancelBtn: function CancelBtn(context) {
		var summernoteui = $.summernote.ui;

		var button = summernoteui.button({
			contents: 'CANCEL',
			tooltip: 'Cancel',
			click: function click() {
				$('.editor-popup').summernote('reset');
				TextEditor.hidePopup();
				$('.input.active').removeClass('active');
			}
		});

		return button.render();
	},
	init: function init(elem) {
		if (elem && elem.html().trim() !== '') {
			$('.editor-popup').html(elem.html());
		}

		$('.editor-popup').summernote({
			height: textEditor.height,
			maxHeight: textEditor.maxHeight,
			toolbar: textEditor.toolbar,
			buttons: {
				save: TextEditor.SaveBtn,
				cancel: TextEditor.CancelBtn
			},
			onCreateLink: function onCreateLink(url) {
				var email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
				var phone = /^\+?[\d()-,.]+/;
				var schemed = /^[a-z]+:/i;
				url = url.trim();
				if (email.test(url)) {
					url = 'mailto:' + url;
				} else if (phone.test(url)) {
					url = 'tel:' + url.replace(/[ ().\-]/g, '');
				} else if (!schemed.test(url)) {
					url = 'http://' + url;
				}
				return url;
			}
		});
		$('.note-editor > .modal').detach().appendTo('body');
	},
	destroy: function destroy() {
		$('.editor-popup').summernote('destroy');
		$('.editor-popup').html('');
	},
	showPopup: function showPopup() {
		$('.note-editor.panel').animate({
			left: '20px'
		}, 150);
	},
	hidePopup: function hidePopup() {
		$('.note-editor.panel').animate({
			left: '-100%'
		}, 150, function () {
			//destroyTextEditor();
			TextEditor.destroy();
		});
	}
};

var UserHistories = {
	get: function get() {
		var userId = getCurrentUserID();
		$('#user-histories').modal('show');

		return getUserHistory(userId);
	},
	save: function save() {
		var id = getCurrentUserID(),
		    username = getCurrentUsername(),
		    contents = $('.canvas.active').html(),
		    template = $('.templates li.active').attr('data-template');
		//console.log(`${id}: ${contents}`);

		// setLoaderHeight();
		$('.loading-overlay').show();

		return saveContent(id, username, template, contents);
	},
	display: function display(datas, disableAutosave) {
		var $histories = $('#user-histories .histories-lists'),
		    username = getCurrentUsername();

		// clear the previous contents on the modal
		clearModalHistories();

		$('#user-histories .current-user').find('span').html(username);

		var _loop = function _loop(list) {
			if (disableAutosave && list === 'autosave') return 'continue';
			var d = list === 'autosave' ? 'Autosave' : moment(list).format('MMMM DD, YYYY - dddd');
			var $date = $('<div>', { class: 'date' }).append('<span>' + d + '</span>'),
			    $ul = $('<ul>');

			var _loop2 = function _loop2(key) {
				// console.log(datas[list][key]);
				var template = datas[list][key].template,
				    contents = datas[list][key].contents || '',
				    time = datas[list][key].uploadTime || null,
				    timeFormatted = time ? moment(time, 'HHmmss').format('HH : mm : ss') : '&nbsp;',
				    dataId = key,
				    $li = $('<li>'),
				    $card = $('<div>', { class: "card", "data-id": dataId, "data-date": list, "template": template }).append('<a href="#"></a>'),
				    $overlay = buildCardOverlay(),
				    $message = $('<div>', { class: 'message success' }).html('Delete Successed'),
				    $delete = $('<div>', { class: "delete-card" }).append('<i class="ion-ios-trash-outline"></i>'),
				    $textTemplate = $('<div>', { class: 'template' }).html('Template ' + template),
				    $textTime = $('<div>', { class: 'time' }).html(timeFormatted);

				$overlay.append($message);
				$card.append($overlay);
				$card.find('a').append($delete).append($textTemplate).append($textTime);
				$li.append($card);

				$li.prependTo($ul);
				$date.append($ul);

				$li.on('click', function (e) {
					e.preventDefault();
					UserHistories.showPreview(d, timeFormatted, template, contents);
				});
				$delete.on('click', function (e) {
					e.stopPropagation();
					UserHistories.deleteAlert(e.currentTarget, 'show');
				});
				$overlay.find('.cancel').on('click', function (e) {
					e.stopPropagation();
					UserHistories.deleteAlert(e.currentTarget.parentNode, 'hide');
				});
				$overlay.find('.delete').on('click', function (e) {
					e.stopPropagation();

					var userID = getCurrentUserID(),
					    dataID = e.currentTarget.parentNode.parentNode.parentNode.getAttribute('data-id');

					//removeHistoryCard(dataID);
					return deleteUserHistory(userID, dataID, list);
				});
			};

			for (var key in datas[list]) {
				_loop2(key);
			}

			$date.append($ul);
			$date.prependTo($histories);
		};

		for (var list in datas) {
			var _ret = _loop(list);

			if (_ret === 'continue') continue;
		}

		$('#user-histories .loading').hide();
		$histories.show();
	},
	deleteAlert: function deleteAlert(elem, toggle) {
		var overlay = elem.parentNode.parentNode.querySelector('.card-overlay');

		if (toggle === 'show') {
			overlay.classList.remove('slideout');
			overlay.style.display = 'block';
		} else if (toggle === 'hide') {
			overlay.classList.add('slideout');
			setTimeout(function () {
				return overlay.style.display = 'none';
			}, 250);
		}
	},
	showPreview: function showPreview(date, time, template, contents) {
		var $preview = $('#user-histories .history-preview'),
		    contentsStipped = contents;

		$preview.find('.title span').empty().html(date + ' - ' + time);
		$preview.find('.preview').empty().append(contents);
		$preview.attr('template', template).css({
			display: 'block',
			opacity: 0,
			top: '200px'
		}).animate({
			opacity: 1,
			top: 0
		}, 150);
	},
	select: function select() {
		var template = $('#user-histories .history-preview').attr('template'),
		    contents = $('#user-histories .history-preview .preview').html();

		updateTableCanvas(template, contents);
		$('#user-histories .history-preview').slideUp(150);
		$('#user-histories').modal('hide');
	}

	/***** TODO: make user able to change to styling themselves *****/
};var styleConfig = {
	fontFamily: '"KievitOT", Verdana, Geneva, sans-serif',
	fontBig: '20px',
	fontSmall: '14px',
	linkColor: '#0091ea'
};

function isEmpty(elm) {
	return elm.val().trim() === '' ? 1 : 0;
}

function checkInputValue() {
	if (isEmpty($(this))) {
		$(this).parent().removeClass('has-value');
	} else {
		$(this).parent().addClass('has-value');
	}
}

function getCurrentUsername() {
	return firebase.auth().currentUser.displayName;
}

function getContentMaxHeight() {
	var canvasH = $('.canvas-container').outerHeight(),
	    sidebarH = $('.sidebar').outerHeight();
	return Math.max(canvasH, sidebarH);
}

function setLayout() {
	var sideBarW = $('.sidebar').outerWidth();

	$('.main .canvas-container').css({
		'margin-left': sideBarW + 'px',
		width: 'calc(100% - ' + sideBarW + 'px)'
	});
}

function sidebarNavigate(e) {
	e.preventDefault();

	var target = $(this).attr('data-id'),
	    current = $('.sidebar .narrow-navs li.active').attr('data-id'),
	    $targetNav = $('.nav.' + target);

	if (current === undefined) {
		$(this).addClass('active');
		showNav($targetNav);
	} else if (target === current) {
		$(this).removeClass('active');
		hideNav($targetNav);
	} else {
		$('.sidebar .narrow-navs li[data-id=' + current + ']').removeClass('active');
		$(this).addClass('active');

		hideNav($('.sidebar .nav.' + current));
		showNav($targetNav);
	}
}

function showNav(elem) {
	var sidebarW = $('.sidebar').outerWidth();

	elem.animate({
		left: sidebarW + 'px'
	}, 200).focus();
}

function hideNav(elem) {
	var ele = elem || $('.sidebar .nav');

	elem.animate({
		left: '-999px'
	}, 150);
}

function initFileDrop(elem) {
	elem.fileDrop({
		onFileRead: function onFileRead(files) {
			var base64data = $.removeUriScheme(files[0].data);

			$('.thumb.active').find('img').attr('src', files[0].data);
			$('.thumb.active').find('img').attr('img-data', files[0].data);

			var uploadingImg = uploadImg(base64data);
			uploadingImg.then(function (result) {
				if (result) {
					doAutosave();
				}
			});

			$('.upload-img-reminder').css('left', '-100%');
		},
		overClass: 'img-dragging',
		removeDataUriScheme: true
	});
}

function doAutosave() {
	var userID = getCurrentUserID(),
	    username = getCurrentUsername(),
	    contents = $('.canvas.active').html(),
	    template = $('.templates li.active').attr('data-template'),
	    autoSave = 1,
	    currAutosaveNum = getCurrAutosaveNum(userID);

	setTimeout(function () {
		$('.autosave-sign').fadeIn(300);
	}, 500);
	setTimeout(function () {
		$('.autosave-sign').fadeOut(300);
	}, 2000);

	return currAutosaveNum.then(function (num) {
		if (num >= 1) {
			deleteOldestRecord(userID, 'autosave');
		}
		return saveContent(userID, username, template, contents, autoSave);
	}).catch(function (err) {
		return console.log('Error: cannot get number of autosave records: ' + err);
	});
}

function getInitial(name) {
	var words = name.split(' ');
	return words[1][0] + words[0][0];
}

function buildUserProfile(user) {
	var $avartar = $('#user-avartar'),
	    $userPhoto = $avartar.find('img'),
	    $profileModal = $('#user-profile-modal'),
	    name = user.displayName,
	    email = user.email,
	    photo = user.photoURL,
	    provider = user.providerData[0].providerId;

	$profileModal.find('.modal-title').html(name);
	$profileModal.find('.logout span').html(name);
	$profileModal.find('.user-email').html(email);
	$profileModal.find('.user-provider').html(provider);

	if (!photo) {
		$userPhoto.hide();
		$avartar.html(getInitial(name));
		return;
	}

	$profileModal.find('.user-photo img').attr('src', photo);
	$userPhoto.attr('src', photo).show();
}

function updateContent() {
	var content = $('.editor-popup').summernote('code');

	// if user is editing on titles, only allow plain text
	if ($('.input.active').hasClass('input-no-style')) {
		content = content.replace(/<\/?[^>]+(>|$)/g, "");
	}

	$('.input.active').html(content);
	modifyStyles($('.input.active'));
}

function styleParagraph(elem) {
	return elem.find('p').css({
		'margin': '0 0 5px 0'
	});
}

function styleLink(elem) {
	elem.find('a').each(function () {
		var elemStyle = {
			fontsize: $(this).css('fons-size') || styleConfig.fontSmall,
			color: $(this).css('color') || styleConfig.linkColor
		};

		$(this).css({
			'font-family': styleConfig.fontFamily,
			'font-size': elemStyle.fontsize,
			'color': elemStyle.color
		});
	});
}

function modifyStyles(elem) {
	styleParagraph(elem);
	styleLink(elem);
}

function toggleEditing() {
	$('.upload-img-reminder').css('left', '-100%');

	if ($('.input.active').length > 0 && !$(this).hasClass('active')) {
		$('.input.active').removeClass('active');
		TextEditor.hidePopup();

		$(this).addClass('active');
		TextEditor.init($(this));
		TextEditor.showPopup();
	} else if ($(this).hasClass('active')) {
		$(this).removeClass('active');
		TextEditor.hidePopup();
	} else {
		TextEditor.init($(this));
		TextEditor.showPopup();
		$(this).addClass('active');
	}
}

function toggleImgUploadUI() {
	if ($('.input.active:not(.thumb)').length > 0) {
		$('.input.active:not(.thumb)').removeClass('active');
		TextEditor.hidePopup();
	}
	// other elems is has active class, remove them first
	if ($('.input.thumb.active').length > 0 && !$(this).hasClass('active')) {
		$('.input.thumb.active').removeClass('active');
		$(this).addClass('active');
		$('.upload-img-reminder').css('left', '20px');
	} else if ($(this).hasClass('active')) {
		$(this).removeClass('active');
		$('.upload-img-reminder').css('left', '-100%');
	} else {
		$(this).addClass('active');
		$('.upload-img-reminder').css('left', '20px');
	}
}

function changeTemplate() {
	// if user clicks on current template, nothing happens
	var template = $(this).attr('data-template');

	if ($('.templates li.active').length > 0 && !$(this).hasClass('active')) {
		$('.templates li.active').removeClass('active');
		$(this).addClass('active');

		$('.canvas.tab.active').removeClass('active');
		$('.canvas.tab[template=' + template + ']').addClass('active');
	} else if ($('.templates li.active').length <= 0) {
		$(this).addClass('active');
		$('.canvas.tab[template=' + template + ']').addClass('active');
	}
}

function resetTemplate() {
	var $canvas = $('.canvas.active'),
	    templateID = $canvas.attr('template'),
	    templateContent = getTemplate(templateID);

	return templateContent.then(function (data) {
		$canvas.html(data.content);
		getWeather();

		$canvas.find('.input.thumb').hover(showImgToolOptions, hideImgToolOptions);
		$canvas.find('.input.thumb').on('click', toggleImgUploadUI);
		$canvas.find('.input.thumb').each(function () {
			initFileDrop($(this));
		});

		$canvas.find('.input:not(.thumb)').on('click', toggleEditing);
		$canvas.find('.input a').on('click', function (e) {
			return e.stopPropagation();
		});
	});
}

function formatLineHeight(contents) {
	var texts = contents.querySelectorAll('.input div');

	texts.forEach(function (val, index, obj) {
		if (val.style.lineHeight !== '') {
			val.style.lineHeight = val.style.lineHeight + '00%';
		}
	});
}

function exportNewsletter() {
	var windowUrl = 'about:blank';

	// also make a duplicate of the content so that we are not modifying the original contents
	var content = document.querySelector('.canvas.active'),
	    dupContent = content.cloneNode(true),
	    printWindow = window.open(windowUrl, 'gNYC Newsletter');

	formatLineHeight(dupContent);

	var imgs = dupContent.querySelectorAll('.thumb img');
	for (var i = 0; i < imgs.length; i++) {
		var imgUrl = imgs[i].getAttribute('img-url') || null;

		if (imgUrl) {
			imgs[i].setAttribute('src', imgUrl);
		}
	}

	printWindow.document.write('<html><head><title>gNYC Newsletter</title></head><body>' + dupContent.innerHTML + "</body>");
}

function setLoaderHeight(loader) {
	var $loader = loader || $('.loading-overlay'),
	    mainH = getContentMaxHeight(),
	    windowH = $(window).height();

	if (mainH < windowH) {
		$loader.css('height', windowH);
	} else {
		$loader.css('height', mainH);
	}
}

function buildCardOverlay() {
	var $overlay = $('<div>', { class: 'card-overlay' }),
	    $deleteBtn = $('<div>', { class: 'button outlined delete' }).html('Delete'),
	    $cancelBtn = $('<div>', { class: 'button outlined cancel' }).html('Cancel'),
	    $buttons = $('<div>', { class: 'buttons' }).append($cancelBtn).append($deleteBtn);

	return $overlay.append($buttons);
}

function saveContentSuccess() {
	var $loader = $('.loading-overlay'),
	    userID = getCurrentUserID();

	$loader.find('.loading').hide();
	$loader.find('.message.success').show();

	setTimeout(function () {
		$loader.fadeOut(150);
		$loader.find('.message.success').hide();
		$loader.find('.loading').show();
	}, 1000);
}

function displayHistories(datas, disableAutosave) {
	if (disableAutosave) return UserHistories.display(datas, disableAutosave);else return UserHistories.display(datas);
}

function removeHistoryCard(dataID) {
	var $card = $('#user-histories .histories-lists .card[data-id=' + dataID + ']'),
	    $buttons = $card.find('.buttons'),
	    buttonsH = $buttons.outerHeight(),
	    buttonsW = $buttons.outerWidth(),
	    $message = $card.find('.message.success');

	$message.css({
		height: buttonsH,
		'line-height': buttonsH + 'px',
		width: buttonsW
	});

	$buttons.fadeOut(150);
	$message.delay(100).fadeIn(300);

	setTimeout(function () {
		if ($card.parents('ul').find('li').length === 1) {
			$card.parents('.date').remove();
		}
		$card.parent('li').remove();
	}, 1000);
}

function closeHistoryPreview() {
	var _this = this;

	$(this).parents('.history-preview').fadeOut(100, function () {
		return $(_this).parents('.history-preview').find('.preview').empty();
	});
}

function updateTableCanvas(template, contents) {
	var $canvas = $('.canvas-container .canvas[template=' + template + ']'),
	    $templateMenuItem = $('.nav.templates li[data-template=' + template + ']');

	$canvas.empty().append(contents);

	getWeather();

	$canvas.find('.input.thumb').hover(showImgToolOptions, hideImgToolOptions);
	$canvas.find('.input.thumb').on('click', toggleImgUploadUI);
	$canvas.find('.input.thumb').each(function () {
		initFileDrop($(this));
	});

	$canvas.find('.input:not(.thumb)').on('click', toggleEditing);
	$canvas.find('.input a').on('click', function (e) {
		return e.stopPropagation();
	});

	// update the canvas tab and side bar navigation
	$('.canvas-container .canvas.active, .nav.templates li.active').removeClass('active');
	$canvas.addClass('active');
	$templateMenuItem.addClass('active');

	$('#user-histories').modal('hide');
}

function clearModalHistories() {
	var $modal = $('#user-histories');

	$modal.find('.histories-lists').empty();
}

function buildWeatherForecast(data) {
	var $weatherContainer = $('.canvas .weather'),
	    count = 0;

	var _loop3 = function _loop3(daily) {
		if (jQuery.isEmptyObject(data[daily])) return 'continue';

		$weatherContainer.each(function () {
			var $day = $(this).find('.day-of-week'),
			    $dailyweather = $(this).find('.daily-weather'),
			    $high = $(this).find('.daily-temperature-high'),
			    $low = $(this).find('.daily-temperature-low');

			$day.eq(count).html(data[daily].day);
			$dailyweather.eq(count).attr('src', data[daily].dayWeather);
			$high.eq(count).html(data[daily].temperature.highest);
			$low.eq(count).html(data[daily].temperature.lowest);
		});

		count++;
	};

	for (var daily in data) {
		var _ret3 = _loop3(daily);

		if (_ret3 === 'continue') continue;
	}
}

function getWeather() {
	var url = weatherConfig.url + '/' + userLocation.key + '?apikey=' + weatherConfig.key;

	return $.ajax({
		type: 'GET',
		url: url,
		contentType: 'jsonp',
		dataType: 'jsonp'
	}).done(function (data) {
		// filter out the information that we don't need
		var dailyForecastData = filterForecastData(data.DailyForecasts);
		buildWeatherForecast(dailyForecastData);
	}).fail(function (err) {
		console.log(err);
	});
}

function filterForecastData(data) {
	// assume data comes in in order
	var filteredData = {};

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var daily = _step.value;

			//console.log(daily);
			var day = convertDateToDay(daily.Date).toLowerCase();
			filteredData[day] = {};

			filteredData[day].date = daily.Date;
			filteredData[day].day = convertDateToDay(daily.Date);
			filteredData[day].temperature = {
				lowest: daily.Temperature.Minimum.Value,
				highest: daily.Temperature.Maximum.Value
			};
			filteredData[day].dayWeather = getWeatherIcon(daily.Day.Icon);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return filteredData;
}

function convertDateToDay(date) {
	// convert date string into date object
	// 0 is Sunday, 1 is Monday
	var dateObj = new Date(date).getDay(),
	    day = void 0;

	switch (dateObj) {
		case 0:
			// Sunday
			day = 'Sun';
			break;
		case 1:
			// Monday
			day = 'Mon';
			break;
		case 2:
			day = 'Tue';
			break;
		case 3:
			day = 'Wed';
			break;
		case 4:
			day = 'Thr';
			break;
		case 5:
			day = 'Fri';
			break;
		case 6:
			// Saturday
			day = 'Sat';
			break;
	}

	return day;
}

function getWeatherIcon(iconNum) {
	var path = 'img/weather/',
	    num = Number(iconNum);

	if (num === 1 || num === 2) {
		path += weatherConfig.icons.sunny;
	} else if (num >= 3 && num <= 4) {
		path += weatherConfig.icons.partlySunny;
	} else if (num >= 5 && num <= 6) {
		path += weatherConfig.icons.mostlyCloudy;
	} else if (num >= 6 && num <= 8) {
		path += weatherConfig.icons.cloudy;
	} else if (num === 11) {
		path += weatherConfig.icons.fog;
	} else if (num >= 12 && num <= 13 || num === 39 || num === 40) {
		path += weatherConfig.icons.showers;
	} else if (num === 14) {
		path += weatherConfig.icons.sunnyShowers;
	} else if (num >= 15 && num <= 17) {
		path += weatherConfig.icons.tStorm;
	} else if (num === 18) {
		path += weatherConfig.icons.rain;
	} else if (num >= 19 && num <= 20) {
		path += weatherConfig.icons.flurry;
	} else if (num === 21) {
		path += weatherConfig.icons.sunnyFlurry;
	} else if (num >= 22 && num <= 23) {
		path += weatherConfig.icons.snow;
	} else if (num >= 24 && num <= 26) {
		path += weatherConfig.icons.sleet;
	} else if (num === 29) {
		path += weatherConfig.icons.rainSnow;
	} else if (num === 30) {
		path += weatherConfig.icons.hot;
	} else if (num === 31) {
		path += weatherConfig.icons.cold;
	} else if (num === 32) {
		path += weatherConfig.icons.windy;
	} // after 32 is night weather so we'll skip those

	return path;
}

function toggleSelectDropdown() {
	var $wrapper = $(this).parent();
	$wrapper.toggleClass('active');
}

function toggleUserProfile(e) {
	var $profile = $('#user-profile'),
	    $avartar = $('#user-avartar');

	if (e) e.preventDefault();

	if (!$profile.hasClass('active')) {
		$profile.focus();
		showUserProfile();
	} else {
		closeUserProfile();
	}
}

function closeUserProfile() {
	var $profile = $('#user-profile'),
	    $avartar = $('#user-avartar');

	$profile.removeClass('active').find('li.active').removeClass('active');
	$avartar.removeClass('active');
	$('#user-profile').css({
		left: '-999px'
	});
}

function showUserProfile() {
	var $profile = $('#user-profile'),
	    $avartar = $('#user-avartar'),
	    sideBarW = $('.sidebar').outerWidth();

	$profile.addClass('active').focus();
	$avartar.addClass('active');

	$('#user-profile').css({
		left: sideBarW + 'px'
	});
}

function toggleUserActions() {
	var action = $(this).attr('action');

	if ($(this).hasClass('active')) {
		$(this).removeClass('active');
	} else {
		$('#user-profile li.active').removeClass('active');
		$(this).addClass('active');
	}

	switch (action) {
		case 'logout':
			doLogout();
			break;
		case 'profile':
			showUserProfileModal();
			break;
		default:
			console.log('Error: action is not in the list');
	}
}

function showUserProfileModal() {
	var $modal = $('#user-profile-modal');

	$modal.modal('show');
}

function selectImgLinkType() {
	var $wrapper = $(this).parents('.single-select'),
	    $input = $wrapper.find('input'),
	    type = $(this).attr('data-value');

	$input.val($(this).html());
	$('input[name="img-url"]').attr('link-type', type);
	$wrapper.removeClass('active');
}

function loginSuccess() {
	$('.login-wrapper .message.success').fadeIn(300).show();
	setTimeout(function () {
		$('.login-wrapper').animate({
			width: 0,
			height: 0
		}, 300, function () {
			return $('.login-wrapper').hide();
		});
	}, 1300);
}

function toggleAutosave() {
	var autosave = $(this).prop('checked'),
	    userID = getCurrentUserID();
	return setAutosave(userID, autosave).then(function () {
		return console.log('after setting');
	});
}

function doLogout(e) {
	if (e) e.preventDefault();
	logout();
	location.reload();
}

function getLocationKey() {
	return getLocation().then(function (data) {
		return $.ajax({
			type: 'GET',
			url: weatherConfig.locationKeyUrl + '/' + data.country + '/search?apikey=' + weatherConfig.key + '&q=' + escape(data.city),
			contentType: 'jsonp',
			dataType: 'jsonp'
		}).then(function (result) {
			return result[0].Key;
		}).fail(function (err) {
			return console.log('Error when getting location key from AccuWeather API:', err);
		});
	}).catch(function (err) {
		return console.log('Error when getting location key:', err);
	});
}

function getLocation() {
	return $.getJSON('http://ipinfo.io/?token=' + geolocationConfig.key, function (data) {
		var userID = getCurrentUserID();

		userLocation['city'] = data.city;
		userLocation['countryCode'] = data.country;
		updateUserLocation(userID, data);

		return data;
	}, function (err) {
		console.log('Error when getting user geolocation data: ' + err);
	});
}

function setUserLocationKey() {
	return getLocationKey().then(function (result) {
		userLocation['key'] = result;
		// getWeather();
	});
}

$(function () {
	var _this2 = this;

	setUserLocationKey();
	setLoaderHeight();
	setLayout();

	/*
 $.getJSON('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D2459115&format=json', (data) => {
 	console.log(data.query.results.channel.item.forecast);
 }, (err) => {
 	console.lot(err);
 });
 */

	$('#user-avartar').on('mousedown', toggleUserProfile);
	$('#user-profile').on('blur', closeUserProfile);
	$('#user-profile li').on('click', toggleUserActions);
	$('#login-google').on('click', loginGoogle);
	$('#login-facebook').on('click', loginFB);
	$('#sidebar-save').on('click', function (e) {
		e.preventDefault();

		$(_this2).addClass('active');
		UserHistories.save();
	});
	$('.sidebar .narrow-navs li').on('click', function (e) {
		return e.preventDefault();
	});
	$('.sidebar .narrow-navs li').on('mousedown', sidebarNavigate);
	$('.nav').on('blur', function (e) {
		var target = $(this).attr('data-id');

		$('.sidebar .narrow-navs li[data-id=' + target + ']').removeClass('active');
		$(this).removeClass('active');
		hideNav($(this));
	});
	$('.nav.home a').on('click', function (e) {
		return e.preventDefault();
	});

	$('.input.thumb').each(function () {
		//let $tools = createToolPopup();
		//$(this).append($tools);
		initFileDrop($(this));
	});

	$('.single-input input').on('keyup', checkInputValue);

	$('#export, #home-export').on('click', exportNewsletter);
	$('#save, #home-save').on('click', UserHistories.save);
	$('#getHistories, #home-getHistories').on('click', UserHistories.get);
	$('#home-reset').on('click', function () {
		$('.nav.home').blur();
		resetTemplate();
	});

	$('.input:not(.thumb)').on('click', toggleEditing);
	$('.input a').on('click', function (e) {
		return e.stopPropagation();
	});

	$('.input.thumb').on('click', toggleImgUploadUI);
	$('.input.thumb').hover(showImgToolOptions, hideImgToolOptions);

	$('.templates li').on('click', changeTemplate);

	$('input[name="img-url"]').on('keyup', function (e) {
		if (e.which === 13) {
			setImgLink();
		}
	});
	$('#select-link-type > input').on('click', toggleSelectDropdown);
	$('#select-link-type ul li').on('click', selectImgLinkType);
	$('#setImgLink').on('click', setImgLink);
	$('#removeImgLink').on('click', removeImgLink);
	$('#img-linking-modal .tab.message.failed .sub-message').on('click', showImgUrlForm);
	$('#test-link').on('click', testLinkUrl);

	$('#user-histories .history-preview .closePreview').on('click', closeHistoryPreview);
	$('#user-histories .history-preview .select-history').on('click', UserHistories.select);

	$('#switch_autosave').on('change', toggleAutosave);

	$('#logout, .logout').on('click', doLogout);

	$(window).on('resize', function () {
		setLoaderHeight();
		setLayout();
	});
});