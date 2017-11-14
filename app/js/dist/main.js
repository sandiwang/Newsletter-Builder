'use strict';

/*
let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});
*/

var textEditor = {
	height: 300,
	maxHeight: 220,
	toolbar: [
	// [groupName, [list of button]]
	['style', ['bold', 'italic', 'underline']], ['font', ['strikethrough', 'superscript', 'subscript']], ['fontsize', ['fontsize', 'height', 'clear']], ['color', ['color']], ['code', ['codeview']], ['para', ['ul', 'ol', 'paragraph']], ['link', ['link', 'picture']], ['cancel', ['cancel']], ['submit', ['save']]]
};

var weatherConfig = {
	key: 'CvzA3RKOLCUuqfAMyao7AFVyqDtrYMW7',
	url: 'http://dataservice.accuweather.com/forecasts/v1/daily/5day',
	locationKey: {
		newyork: 349727
	},
	icons: {
		sunny: 'weather_icon-01.png',
		partlySunny: 'weather_icon-17.png',
		cloudy: 'weather_icon-16.png',
		fog: 'weather_icon-39.png',
		showers: 'weather_icon-19.png',
		sunnyShowers: 'weather_icon-20.png',
		rain: 'weather_icon-36.png',
		tStorm: 'weather_icon-28.png',
		flurry: 'weather_icon-25.png',
		sunnyFlurry: 'weather_icon-26.png',
		snow: 'weather_icon-31.png',
		sleet: 'weather_icon-22.png',
		windy: 'weather_icon-57.png',
		hot: 'weather_icon-65.png',
		cold: 'weather_icon-62.png'
	}
};

var SaveBtn = function SaveBtn(context) {
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
};

var CancelBtn = function CancelBtn(context) {
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
};

var TextEditor = {
	init: function init(elem) {
		if (elem && elem.html().trim() !== '') {
			$('.editor-popup').html(elem.html());
		}

		$('.editor-popup').summernote({
			height: textEditor.height,
			maxHeight: textEditor.maxHeight,
			toolbar: textEditor.toolbar,
			buttons: {
				save: SaveBtn,
				cancel: CancelBtn
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
	display: function display(datas) {
		var $histories = $('#user-histories .histories-lists'),
		    username = getCurrentUsername();

		// clear the previous contents on the modal
		clearModalHistories();

		$('#user-histories .current-user').find('span').html(username);

		var _loop = function _loop(list) {
			var d = list === 'autosave' ? 'Autosave' : moment(list).format('MMMM DD, YYYY - dddd');
			var $date = $('<div>', { class: 'date' }).append('<span>' + d + '</span>').append('<ul></ul>');

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

				$date.append($li);
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
			$histories.append($date);
		};

		for (var list in datas) {
			_loop(list);
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
			}, 300);
		}
	},
	removeHistoryCard: function removeHistoryCard(dataID) {
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
			$card.parent('li').remove();
		}, 1000);
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

	$('#user-profile').css({
		left: sideBarW + 'px'
	});
}

function sidebarNavigate(e) {
	e.preventDefault();

	var target = $(this).attr('data-target'),
	    current = $('.sidebar .narrow-navs li.active').attr('data-target'),
	    $targetNav = $('.nav.' + target);

	if (current === undefined) {
		$(this).addClass('active');
		showNav($targetNav);
	} else if (target === current) {
		$(this).removeClass('active');
		hideNav($targetNav);
	} else {
		$('.sidebar .narrow-navs li[data-target=' + current + ']').removeClass('active');
		$(this).addClass('active');

		hideNav($('.sidebar .nav.' + current));
		showNav($targetNav);
	}
}

function showNav(elem) {
	var sidebarW = $('.sidebar').outerWidth();

	elem.animate({
		left: sidebarW + 'px'
	}, 200);
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

function buildUserProfile(name, email, photo) {
	var $avartar = $('#user-avartar'),
	    $userPhoto = $avartar.find('img'),
	    $profileModal = $('#user-profile-modal');

	$profileModal.find('.modal-title').html(name);
	$profileModal.find('.logout span').html(name);
	$profileModal.find('.user-email').html(email);

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

function displayHistories(datas) {
	return UserHistories.display(datas);
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
	var url = weatherConfig.url + '/' + weatherConfig.locationKey.newyork + '?apikey=' + weatherConfig.key;

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
	} else if (num >= 3 || num <= 5) {
		path += weatherConfig.icons.partlySunny;
	} else if (num >= 6 || num <= 8) {
		path += weatherConfig.icons.cloudy;
	} else if (num === 11) {
		path += weatherConfig.icons.fog;
	} else if (num >= 12 || num <= 13) {
		path += weatherConfig.icons.showers;
	} else if (num === 14) {
		path += weatherConfig.icons.sunnyShowers;
	} else if (num >= 15 || num <= 17) {
		path += weatherConfig.icons.tStorm;
	} else if (num === 18) {
		path += weatherConfig.icons.rain;
	} else if (num >= 19 || num <= 20) {
		path += weatherConfig.icons.flurry;
	} else if (num === 21) {
		path += weatherConfig.icons.sunnyFlurry;
	} else if (num >= 22 || num <= 23) {
		path += weatherConfig.icons.snow;
	} else if (num >= 24 || num <= 26) {
		path += weatherConfig.icons.sleet;
	} else if (num === 29) {
		// rain and snow
	} else if (num === 30) {
		path += weatherConfig.icons.hot;
	} else if (num === 31) {
		path += weatherConfig.icons.cold;
	} else if (num === 31) {
		path += weatherConfig.icons.windy;
	}

	return path;
}

function toggleSelectDropdown() {
	var $wrapper = $(this).parent();
	$wrapper.toggleClass('active');
}

function toggleUserProfile() {
	var $profile = $('#user-profile'),
	    $avartar = $('#user-avartar');

	if ($profile.hasClass('active')) {
		$profile.find('li.active').removeClass('active');
		$profile.off('blur', toggleUserProfile);
	} else {
		$profile.focus();
		$profile.on('blur', toggleUserProfile);
	}

	$avartar.toggleClass('active');
	$profile.toggleClass('active');
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
			console.log('profile');
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

function doLogout(e) {
	if (e) e.preventDefault();
	logout();
	location.reload();
}

$(function () {
	getWeather();
	setLoaderHeight();
	setLayout();

	/*
 $.getJSON('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D2459115&format=json', (data) => {
 	console.log(data.query.results.channel.item.forecast);
 }, (err) => {
 	console.lot(err);
 });
 */
	$('#user-avartar').on('click', toggleUserProfile);
	$('#user-profile li').on('click', toggleUserActions);
	$('#login-google').on('click', loginGoogle);
	$('#login-facebook').on('click', loginFB);
	$('.sidebar .narrow-navs li').on('click', sidebarNavigate);

	$('.input.thumb').each(function () {
		//let $tools = createToolPopup();
		//$(this).append($tools);
		initFileDrop($(this));
	});

	$('.single-input input').on('keyup', checkInputValue);

	$('#export').on('click', exportNewsletter);
	$('#save').on('click', UserHistories.save);
	$('#getHistories').on('click', UserHistories.get);

	$('.input:not(.thumb)').on('click', toggleEditing);
	$('.input a').on('click', function (e) {
		return e.stopPropagation();
	});

	$('.input.thumb').on('click', toggleImgUploadUI);
	$('.input.thumb').hover(showImgToolOptions, hideImgToolOptions);

	$('.templates li').on('click', changeTemplate);

	$('#select-link-type > input').on('click', toggleSelectDropdown);
	$('#select-link-type ul li').on('click', selectImgLinkType);
	$('#setImgLink').on('click', setImgLink);
	$('#removeImgLink').on('click', removeImgLink);
	$('#img-linking-modal .tab.message.failed .sub-message').on('click', showImgUrlForm);
	$('#test-link').on('click', testLinkUrl);

	$('#user-histories .history-preview .closePreview').on('click', closeHistoryPreview);
	$('#user-histories .history-preview .select-history').on('click', UserHistories.select);

	$('#logout, .logout').on('click', doLogout);

	$(window).on('resize', function () {
		setLoaderHeight();
		setLayout();
	});
});