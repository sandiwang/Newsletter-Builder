/*
let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});
*/

const textEditor = {
	height: 300,
	maxHeight: 250,
	toolbar: [
	  // [groupName, [list of button]]
	  ['style', ['bold', 'italic', 'underline']],
	  ['font', ['strikethrough', 'superscript', 'subscript']],
	  ['fontsize', ['fontsize', 'height']],
	  ['color', ['color']],
	  ['para', ['ul', 'ol', 'paragraph']],
	  ['link', ['link', 'picture']],
	  ['cancel', ['cancel']],
	  ['submit', ['save']]
	]
};

const weatherConfig = {
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

let SaveBtn = function (context) {
  const summernoteui = $.summernote.ui;

  let button = summernoteui.button({
    contents: 'SAVE',
    tooltip: 'Save',
    click: () => {
    	updateContent();
    	hideTextEditorPopup();

    	$('.input.active').removeClass('active');
    }
  });

  return button.render();
}

let CancelBtn = function (context) {
	const summernoteui = $.summernote.ui;

	let button = summernoteui.button({
		contents: 'CANCEL',
		tooltip: 'Cancel',
		click: () => {
			$('.editor-popup').summernote('reset');
			hideTextEditorPopup();
			$('.input.active').removeClass('active');
		}
	});

	return button.render();
}

/***** TODO: make user able to change to styling themselves *****/
let styleConfig = {
	fontFamily: '"KievitOT", Verdana, Geneva, sans-serif',
	fontBig: '20px',
	fontSmall: '14px',
	linkColor: '#0091ea'
}

function isEmpty(elm) {
	return elm.val().trim() === '' ? 1 : 0;
}

function checkInputValue() {
	if(isEmpty($(this))) {
		$(this).parent().removeClass('has-value');
	} else {
		$(this).parent().addClass('has-value');
	}
}

function getCurrentUsername() {
	return Cookies.getJSON().name.username;
}

function updateContent() {
	let content = $('.editor-popup').summernote('code');

	// if user is editing on titles, only allow plain text
	if( $('.input.active').hasClass('input-no-style') ) {
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
	elem.find('a').each(function(){
		let elemStyle = {
			fontsize: $(this).css('fons-size') || styleConfig.fontSmall,
			color: $(this).css('color') || styleConfig.linkColor
		}

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
	if(elem && elem.html().trim() !== ''){
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
	  onCreateLink: (url) => {
	  	let email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
      let phone = /^\+?[\d()-,.]+/
      let schemed = /^[a-z]+:/i
      url = url.trim();
      if (email.test(url)) {
          url = 'mailto:' + url;
      } else if (phone.test(url)) {
                  url = 'tel:' + url.replace(/[ ().\-]/g,'');
      } else if (!schemed.test(url)) {
          url = 'http://' + url;
      }
      return url;
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
	}, 150, () => {
		destroyTextEditor();
	});
}

function toggleEditing() {
	$('.upload-img-reminder').css('left', '-100%');

	if( $('.input.active').length > 0 && !$(this).hasClass('active') ){
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
	if( $('.input.active:not(.thumb)').length > 0 ) {
		$('.input.active:not(.thumb)').removeClass('active');
		hideTextEditorPopup();
	}
	// other elems is has active class, remove them first
	if( $('.input.thumb.active').length > 0 && !$(this).hasClass('active') ) {
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
	let template = $(this).attr('data-template');

	if( $('.templates li.active').length > 0 && !$(this).hasClass('active') ) {
		$('.templates li.active').removeClass('active');
		$(this).addClass('active');

		$('.canvas.tab.active').removeClass('active');
		$(`.canvas.tab[template=${template}]`).addClass('active');
	} else if ($('.templates li.active').length <= 0) {
		$(this).addClass('active');
		$(`.canvas.tab[template=${template}]`).addClass('active');
	}
}

function exportNewsletter() {
	const windowUrl = 'about:blank';

	// also make a duplicate of the content so that we are not modifying the original contents
	let content = document.querySelector('.canvas.active'),
			dupContent = content.cloneNode(true),
  		printWindow = window.open(windowUrl, 'gNYC Newsletter');		

  let imgs = dupContent.querySelectorAll('.thumb img');
  for(let i=0 ; i<imgs.length ; i++){
  	let imgUrl = imgs[i].getAttribute('img-url') || null;

  	if( imgUrl ){
  		imgs[i].setAttribute('src', imgUrl);
  	}
  }

  printWindow.document.write('<html><head><title>gNYC Newsletter</title></head><body>' + dupContent.innerHTML + "</body>");
}

function setLoaderHeight(loader) {
	let $loader = loader || $('.loading-overlay'),
			canvasH = $('.canvas-container').outerHeight(),
			sidebarH = $('.sidebar').outerHeight(),
			mainH = Math.max(canvasH, sidebarH),
			windowH = $(window).height();

	if(mainH < windowH) {
		$loader.css('height', windowH);
	} else {
		$loader.css('height', mainH);
	}
}

function saveHistories() {
	let id = Cookies.getJSON().name.userID,
			username = Cookies.getJSON().name.username,
			contents = $('.canvas.active').html(),
			template = $('.templates li.active').attr('data-template');
	//console.log(`${id}: ${contents}`);

	// setLoaderHeight();
	$('.loading-overlay').show();

	return saveContent(id, username, template, contents);
}

function saveContentSuccess() {
	let $loader = $('.loading-overlay');

	$loader.find('.loading').hide();
	$loader.find('.message.success').show();
	
	
	setTimeout(() => {
		$loader.fadeOut(150);
		$loader.find('.message.success').hide();
		$loader.find('.loading').show();
	}, 1000);
	
}

function getHistories() {
	let userId = Cookies.getJSON().name.userID;
	$('#user-histories').modal('show');

	return getUserHistory(userId);
}

function displayHistories(datas) {
	let $histories = $('#user-histories .histories-lists'),
			username = getCurrentUsername();

	// clear the previous contents on the modal
	clearModalHistories();

	$('#user-histories .current-user').find('span').html(username);

	for(let list in datas) {
		let d = moment(list).format('MMMM DD, YYYY - dddd');
		let $date = $('<div>', {class: 'date'}).append(`<span>${d}</span>`).append('<ul></ul>');

		for(let key in datas[list]) {
			// console.log(datas[list][key]);
			let template = datas[list][key].template,
					contents = datas[list][key].contents || '',
					time = datas[list][key].uploadTime || null,
					timeFormatted = time ? moment(time, 'HHmmss').format('HH : mm : ss') : '&nbsp;',
					dataId = key,
					$li = $('<li>'),
					$card = $('<div>', {class: "card", "data-id": dataId, "template": template}).append('<a href="#"></a>'),
					$textTemplate = $('<div>', {class: 'template'}).html(`Template ${template}`),
					$textTime = $('<div>', {class: 'time'}).html(timeFormatted);

			$card.find('a').append($textTemplate).append($textTime);
			$li.append($card);

			$date.append($li);
			$li.on('click', (e) => {
				e.preventDefault();
				showHistoryPreview(d, timeFormatted, template, contents);
			});
		}
		$histories.append($date);
	}

	$('#user-histories .loading').hide();
	$histories.show();
}

function showHistoryPreview(date, time, template, contents) {
	let $preview = $('#user-histories .history-preview'),
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
}

function closeHistoryPreview() {
	$(this).parents('.history-preview').fadeOut(100, () => $(this).parents('.history-preview').find('.preview').empty() );
}

function selectHistory() {
	let template = $('#user-histories .history-preview').attr('template'),
			contents = $('#user-histories .history-preview .preview').html();

	updateTableCanvas(template, contents);
	$('#user-histories .history-preview').slideUp(150);
	$('#user-histories').modal('hide');
}

function updateTableCanvas(template, contents) {
	let $canvas = $(`.canvas-container .canvas[template=${template}]`),
			$templateMenuItem = $(`.nav.templates li[data-template=${template}]`);

	$canvas.empty().append(contents);

	// update the canvas tab and side bar navigation
	$('.canvas-container .canvas.active, .nav.templates li.active').removeClass('active');
	$canvas.addClass('active');
	$templateMenuItem.addClass('active');

	$('#user-histories').modal('hide');
}

function clearModalHistories() {
	let $modal = $('#user-histories');

	$modal.find('.histories-lists').empty();
}

function buildWeatherForecast(data) {
	let $weatherContainer = $('.canvas .weather'),
			$day = $weatherContainer.find('.day-of-week'),
			$dailyweather = $weatherContainer.find('.daily-weather'),
			$high = $weatherContainer.find('.daily-temperature-high'),
			$low = $weatherContainer.find('.daily-temperature-low'),
			count = 0;

	for(let daily in data){
		// console.log(data[daily]);
		if(jQuery.isEmptyObject(data[daily])) continue;

		$day.eq(count).html(data[daily].day);
		$dailyweather.eq(count).attr('src', data[daily].dayWeather);
		$high.eq(count).html(data[daily].temperature.highest);
		$low.eq(count).html(data[daily].temperature.lowest);
		count++;
	}

}

function getWeather() {
	let url = `${weatherConfig.url}/${weatherConfig.locationKey.newyork}?apikey=${weatherConfig.key}`;

	return $.ajax({
						type: 'GET',
						url: url,
						contentType: 'jsonp',
						dataType: 'jsonp'
					})
					.done((data) => {
						// filter out the information that we don't need
						let dailyForecastData = filterForecastData(data.DailyForecasts);
						buildWeatherForecast(dailyForecastData);
					})
					.fail((err) => {
						console.log(err);
					});
}

function filterForecastData(data) {
	let filteredData = {
		mon: {},
		tue: {},
		wed: {},
		thr: {},
		fri: {},
		sat: {},
		sun: {}
	};

	for (let daily of data) {
		//console.log(daily);
		let day = convertDateToDay(daily.Date).toLowerCase();

		filteredData[day].date = daily.Date;
		filteredData[day].day = convertDateToDay(daily.Date);
		filteredData[day].temperature = {
			lowest: daily.Temperature.Minimum.Value,
			highest: daily.Temperature.Maximum.Value
		}
		filteredData[day].dayWeather = getWeatherIcon(daily.Day.Icon);
	}

	return filteredData;
}

function convertDateToDay(date) {
	// convert date string into date object
	// 0 is Sunday, 1 is Monday
	let dateObj = new Date(date).getDay(),
			day;

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
	let path = 'img/weather/',
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
	let $wrapper = $(this).parent();
	$wrapper.toggleClass('active');
}

function selectImgLinkType() {
	let $wrapper = $(this).parents('.single-select'),
			$input = $wrapper.find('input'),
			type = $(this).attr('data-value');

	$input.val($(this).html());
	$('input[name="img-url"]').attr('link-type', type);
	$wrapper.removeClass('active');
}

function submitUsername() {
	let $input = $(this).parents('.login-wrapper').find('input'),
			name = $input.val().trim();

	if(name === '') {
		console.log('username cannot be empty');
		return;
	}

	if (existingUsername(name)){
		console.log('username already existed');
		$('.login-wrapper .message.failed').html('Username already existed!').css('display', 'inline-block');
	} else {
		let userId = Date.now();
		setCookie(userId, name);
		createUser(userId, name);

	}
}

function existingUsername(name) {
	let nameStr = name.replace(/\s+/g, ''),
			existing;

	return existing = Cookies.get()[nameStr] ? 1 : 0;
}

function setCookie(userId, name) {
	//let nameStr = name.replace(/\s+/g, '');

	Cookies.set('name', {
		username: name,
		userID: userId,
		expires: 30
	});
}

function loginSuccess() {
	$('.login-wrapper .message.success').fadeIn(300).show();
	setTimeout(() => {
		$('.login-wrapper').animate({
			width: 0,
			height: 0
		}, 300, () => $('.login-wrapper').hide());
	}, 1300);
}

function doLogout(e) {
	e.preventDefault();
	Cookies.remove('name');
	location.reload();
}

function hasVisited() {
	return $.isEmptyObject(Cookies.get()) ? 0 : 1;
}

function checkVisted() {
	let visited = hasVisited();
	if (visited) {
		$('.login-wrapper').hide();
	} else {
		$('.login-wrapper').show();
	}
	$('.main').css('opacity', 1);
}

$(function(){
	getWeather();
	setLoaderHeight();

	$('#submit-username').on('click', submitUsername);

	$('.input.thumb').each(function(){
		//let $tools = createToolPopup();
		//$(this).append($tools);

		$(this).fileDrop({
			onFileRead: (files) => {
				let base64data = $.removeUriScheme(files[0].data);

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

	$('#export').on('click', exportNewsletter);
	$('#save').on('click', saveHistories);
	$('#getHistories').on('click', getHistories);

	$('.input:not(.thumb)').on('click', toggleEditing);
	$('.input a').on('click', (e) => e.stopPropagation());

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
	$('#user-histories .history-preview .select-history').on('click', selectHistory);

	$('#logout').on('click', doLogout);
	
	$(window).on('resize', () => {
		setLoaderHeight();
	});
});

$(window).on('load', () => {
	checkVisted();
});