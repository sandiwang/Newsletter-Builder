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
	maxHeight: 250,
	toolbar: [
	// [groupName, [list of button]]
	['style', ['bold', 'italic', 'underline']], ['font', ['strikethrough', 'superscript', 'subscript']], ['fontsize', ['fontsize', 'height']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['link', ['link', 'picture']], ['cancel', ['cancel']], ['submit', ['save']]]
};

var SaveBtn = function SaveBtn(context) {
	var summernoteui = $.summernote.ui;

	var button = summernoteui.button({
		contents: 'SAVE',
		tooltip: 'Save',
		click: function click() {
			updateContent();
			hideTextEditorPopup();

			$('.input.active').removeClass('active');
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
			hideTextEditorPopup();
			$('.input.active').removeClass('active');
		}
	});

	return button.render();
};

/***** TODO: make user able to change to styling themselves *****/
var styleConfig = {
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

function initTextEditor(elem) {
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
		}
	});
	$('.note-editor > .modal').detach().appendTo('body');
}

function destroyTextEditor() {
	$('.editor-popup').summernote('destroy');
	$('.editor-popup').html('');
}

function showTextEditorPopup() {
	$('.note-editor.panel').animate({
		left: '20px'
	}, 150);
}

function hideTextEditorPopup() {
	$('.note-editor.panel').animate({
		left: '-100%'
	}, 150, function () {
		destroyTextEditor();
	});
}

function toggleEditing() {
	$('.upload-img-reminder').css('left', '-100%');

	if ($('.input.active').length > 0 && !$(this).hasClass('active')) {
		$('.input.active').removeClass('active');
		hideTextEditorPopup();

		$(this).addClass('active');
		initTextEditor($(this));
		showTextEditorPopup();
	} else if ($(this).hasClass('active')) {
		$(this).removeClass('active');
		hideTextEditorPopup();
	} else {
		initTextEditor($(this));
		showTextEditorPopup();
		$(this).addClass('active');
	}
}

function toggleImgUploadUI() {
	if ($('.input.active:not(.thumb)').length > 0) {
		$('.input.active:not(.thumb)').removeClass('active');
		hideTextEditorPopup();
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

function exportNewsletter() {
	var windowUrl = 'about:blank';

	// also make a duplicate of the content so that we are not modifying the original contents
	var content = document.querySelector('.canvas.active'),
	    dupContent = content.cloneNode(true),
	    printWindow = window.open(windowUrl, 'gNYC Newsletter');

	var imgs = dupContent.querySelectorAll('.thumb img');
	for (var i = 0; i < imgs.length; i++) {
		var imgUrl = imgs[i].getAttribute('img-url') || null;

		if (imgUrl) {
			imgs[i].setAttribute('src', imgUrl);
		}
	}

	printWindow.document.write('<html><head><title>gNYC Newsletter</title></head><body>' + dupContent.innerHTML + "</body>");
}

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
	}).fail(function (err) {
		console.log(err);
		console.log(getWeatherIcon(1));
	});
}

function filterForecastData(data) {
	var filteredData = {
		mon: {},
		tue: {},
		wed: {},
		thr: {},
		fri: {},
		sat: {},
		sun: {}
	};

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var daily = _step.value;

			//console.log(daily);
			var day = convertDateToDay(daily.Date).toLowerCase();

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

function selectImgLinkType() {
	var $wrapper = $(this).parents('.single-select'),
	    $input = $wrapper.find('input'),
	    type = $(this).attr('data-value');

	$input.val($(this).html());
	$('input[name="img-url"]').attr('link-type', type);
	$wrapper.removeClass('active');
}

$(function () {
	// getWeather();

	$('.input.thumb').each(function () {
		//let $tools = createToolPopup();
		//$(this).append($tools);

		$(this).fileDrop({
			onFileRead: function onFileRead(files) {
				var base64data = $.removeUriScheme(files[0].data);

				$('.thumb.active').find('img').attr('src', files[0].data);
				$('.thumb.active').find('img').attr('img-data', files[0].data);

				uploadImg(base64data);
				$('.upload-img-reminder').css('left', '-100%');
			},
			overClass: 'img-dragging',
			removeDataUriScheme: true
		});
	});

	$('.single-input input').on('keyup', checkInputValue);

	$('.export').on('click', exportNewsletter);

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
});