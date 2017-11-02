'use strict';

var hideModalAfterDuration = 1000;
var icons = {
	linking: 'ion-ios-infinite-outline',
	cropping: 'ion-ios-crop',
	close: 'ion-ios-close-outline',
	cropRound: 'ion-ios-ionic-outline'
};

var imgCroppedData = {
	dataURL: null,
	data: null
};

function createToolPopup() {
	var $popup = $('<ul>', { class: 'tool-popup' }),
	    $linking = $('<li>').append('<a class="linking" title="Hyperlink"><i class="' + icons.linking + '"></i></a>'),
	    $cropping = $('<li>').append('<a class="cropping" title="Crop Image"><i class="' + icons.cropping + '"></i></a>');

	return $popup.append($linking).append($cropping);
}

function createCropBtns() {
	var $btns = $('<ul>', { class: 'crop-btns' }),
	    $cancelBtn = $('<li>', { class: 'cancel-crop' }).append('<a title="Cancel"><i class="' + icons.close + '"></i></a>'),
	    $cropRoundedBtn = $('<li>', { class: 'toggle-crop-rounded' }).append('<a title="Rounded Crop Box"><i class="' + icons.cropRound + '"></i></a>'),
	    $cropBtn = $('<li>', { class: 'confirm-crop' }).append('<a title="Crop Image"><i class="' + icons.cropping + '"></i></a>');

	return $btns.append($cancelBtn).append($cropRoundedBtn).append($cropBtn);
}

function populateCurrentLink(elem) {
	var url = elem.find('a').attr('href');

	$('#img-linking-modal input[name="img-url"]').val(url);
	$('#img-linking-modal .url-form .single-input').addClass('has-value');
}

function clearCurrentLink() {
	$('#img-linking-modal input[name="img-url"]').val('');
	$('#img-linking-modal .url-form .single-input').removeClass('has-value');
}

function showImgLinkModal() {
	var imgContainer = $('.input.thumb.hovering').attr('data-id');

	$('#img-linking-modal').find('.tab.active').removeClass('active');
	$('#img-linking-modal').find('.tab.url-form').addClass('active');
	$('#img-linking-modal').find('.modal-footer button').show();

	if ($('.input.thumb.hovering').children('a').length > 0) {
		populateCurrentLink($('.input.thumb.hovering'));
	} else {
		clearCurrentLink();
	}

	$('#img-linking-modal').attr('target-img', imgContainer).modal('show');
}

function toggleRoundedCropBox(e) {
	var $imgContainer = $('.input.thumb.img-cropping');

	e.preventDefault();
	e.stopPropagation();

	$imgContainer.toggleClass('crop-rounded');
}

function showImgCropping() {

	var $img = $('.input.thumb.hovering').find('img'),
	    imgData = $img.attr('img-data') || null;

	if (imgData) $img.attr('src', imgData);

	$img.cropper({
		aspectRatio: 1 / 1,
		viewMode: 1,
		minContainerWidth: 135,
		minContainerHeight: 135,
		movable: true,
		autoCropArea: 0,
		checkCrossOrigin: true,
		built: function built() {
			//$img.cropper("setCropBoxData", { width: "135", height: "135" })
		},
		crop: function crop(e) {
			// Output the result data for cropping image.
			// console.log(e.x);
			// console.log(e.y);
			imgCroppedData.dataURL = $img.cropper('getCroppedCanvas').toDataURL();
			imgCroppedData.data = $img.cropper('getCroppedCanvas');
		}
	});

	$img.on('ready', function () {
		$img.cropper("setCropBoxData", { width: "135", height: "135" });

		$img.parent().addClass('img-cropping');
		$('.cropper-container').on('click', function (e) {
			return e.stopPropagation();
		});
		showCropBtns($img.parent());
	});
}

function showCropBtns(elem) {
	var popup = createCropBtns(elem);

	elem.append(popup);

	elem.find('.confirm-crop a').on('click', cropImg);
	elem.find('.cancel-crop a').on('click', cancelCropping);
	elem.find('.toggle-crop-rounded a').on('click', toggleRoundedCropBox);
}

function cropImg(e) {
	e.preventDefault();
	e.stopPropagation();

	var $img = $('.input.thumb.img-cropping img'),
	    rounded = $img.parent().hasClass('crop-rounded') ? 1 : 0,
	    imgData = void 0;
	//imgDataBase64 = $img.cropper('getCroppedCanvas') === null ? null : $img.cropper('getCroppedCanvas').toDataURL();

	if (imgCroppedData.data === null) {
		$img.cropper('destroy');
		return;
	}

	if (rounded) {
		imgData = getRoundedCanvas(imgCroppedData.data);

		$img.attr('data-img', imgData.toDataURL()).attr('src', imgData.toDataURL());
		uploadImg($.removeUriScheme(imgData.toDataURL()));

		$img.parent().removeClass('crop-rounded');
	} else {
		imgData = $.removeUriScheme(imgCroppedData.dataURL);

		$img.attr('data-img', imgCroppedData.dataURL).attr('src', imgCroppedData.dataURL);
		uploadImg(imgData);
	}

	//$img.parent().removeClass('img-cropping').find('.crop-btns').remove();
	$img.cropper('destroy');
}

function getRoundedCanvas(data) {
	var canvas = document.createElement('canvas');
	var width = data.width;
	var height = data.height;
	var context = canvas.getContext('2d');

	canvas.width = width;
	canvas.height = height;

	context.imageSmoothingEnabled = true;
	context.drawImage(data, 0, 0, width, height);
	context.globalCompositeOperation = 'destination-in';
	context.beginPath();
	context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
	context.fill();

	return canvas;
}

function cancelCropping(e) {
	e.preventDefault();
	e.stopPropagation();

	var $img = $('.input.thumb.img-cropping img');

	$img.cropper('destroy');
	$img.parent().removeClass('img-cropping').find('.crop-btns').remove();
}

function doImageTask(e) {
	e.preventDefault();
	e.stopPropagation();

	var task = $(this).attr('class');

	switch (task) {
		case 'linking':
			showImgLinkModal();
			break;
		case 'cropping':
			showImgCropping();
			break;
		default:
			console.log('Not in the tool lists: ' + task);
	}
}

function setImgLink() {
	var $modal = $(this).parents('.modal'),
	    $input = $modal.find('input[name="img-url"]'),
	    target = $modal.attr('target-img'),
	    $targetImgContainer = $('.canvas-container .canvas.active .input.thumb[data-id=' + target + ']'),
	    url = $input.val().trim(),
	    link = '<a href="' + url + '" target="_blank"></a>';

	if (url === '') return;

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();

	try {
		if ($targetImgContainer.find('a').length > 0) {
			$targetImgContainer.find('a').attr('href', url);
		} else {
			$targetImgContainer.find('img').wrap(link);
			$targetImgContainer.find('a').on('click', function (e) {
				e.preventDefault();
			});
		}

		$modal.find('.tab.message.success [data-id="link-added"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(function () {
			return $modal.modal('hide');
		}, hideModalAfterDuration);
	} catch (err) {
		console.log('Cannot add image link: ' + err);
		$modal.find('.tab.message.failed').addClass('active');
	}

	$modal.find('.single-input').removeClass('has-value');
	$input.val('');
	$modal.find('.modal-footer button').hide();
}

function removeImgLink() {
	var $modal = $(this).parents('.modal'),
	    target = $modal.attr('target-img'),
	    $targetImgContainer = $('.canvas-container .canvas.active .input.thumb[data-id=' + target + ']'),
	    contents = void 0;

	if ($targetImgContainer.find('a').length <= 0) return;

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();
	contents = $targetImgContainer.find('a').contents();

	try {
		$targetImgContainer.find('a').replaceWith(contents);

		$modal.find('.tab.message.success [data-id="link-removed"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(function () {
			return $modal.modal('hide');
		}, hideModalAfterDuration);
	} catch (err) {
		console.log('Cannot remove image links: ' + err);
		$modal.find('.tab.message.failed').addClass('active');
	}

	$modal.find('.modal-footer button').hide();
}

function showImgToolOptions() {
	var $tools = createToolPopup();
	$(this).addClass('hovering').append($tools);

	$tools.find('a').on('click', doImageTask);
}

function hideImgToolOptions() {
	$(this).find('.tool-popup').remove();
	$(this).removeClass('hovering');
}

function showImgUrlForm() {
	$(this).parents('.modal').find('.tab.active').removeClass('active');
	$(this).parents('.modal').find('.tab.url-form').addClass('active');
}

function testLinkUrl() {
	var url = $(this).siblings('input').val();

	window.open(url);
}