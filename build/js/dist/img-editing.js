const hideModalAfterDuration = 1000;
const icons = {
	linking: 'ion-ios-infinite-outline',
	cropping: 'ion-ios-crop'
};

let imgCroppedData;

function createToolPopup() {
	let $popup = $('<ul>', { class: 'tool-popup' }),
	    $linking = $('<li>').append(`<a class="linking" title="Hyperlink"><i class="${icons.linking}"></i></a>`),
	    $cropping = $('<li>').append(`<a class="cropping" title="Crop Image"><i class="${icons.cropping}"></i></a>`);

	return $popup.append($linking).append($cropping);
}

function populateCurrentLink(elem) {
	let url = elem.find('a').attr('href');

	$('#img-linking-modal input[name="img-url"]').val(url);
	$('#img-linking-modal .url-form .single-input').addClass('has-value');
}

function clearCurrentLink() {
	$('#img-linking-modal input[name="img-url"]').val('');
	$('#img-linking-modal .url-form .single-input').removeClass('has-value');
}

function showImgLinkModal() {
	let imgContainer = $('.input.thumb.hovering').attr('data-id');

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

function showImgCropping() {

	let $img = $('.input.thumb.hovering').find('img'),
	    imgData = $img.attr('img-data') || null;

	if (imgData) $img.attr('src', imgData);

	$img.cropper({
		aspectRatio: 1 / 1,
		viewMode: 1,
		cropBoxResizable: false,
		minContainerWidth: 135,
		minContainerHeight: 135,
		minCropBoxWidth: 135,
		minCropBoxHeight: 135,
		autoCropArea: 0,
		checkCrossOrigin: true,
		built: () => {
			//$img.cropper("setCropBoxData", { width: "135", height: "135" })
		},
		crop: e => {
			// Output the result data for cropping image.
			// console.log(e.x);
			// console.log(e.y);
			imgCroppedData = $img.cropper('getCroppedCanvas').toDataURL();
		}
	});

	$img.on('ready', () => {
		$img.cropper("setCropBoxData", { width: "135", height: "135" });

		$img.parent().addClass('img-cropping');
		$('.cropper-container').on('click', e => e.stopPropagation());
		showCropBtns($img.parent());
	});
}

function createCropBtns() {
	let $btns = $('<ul>', { class: 'crop-btns' }),
	    $cropBtn = $('<li>', { class: 'confirm-crop' }).append('<a title="Crop"><i class="ion-ios-crop"></i></a>'),
	    $cancelBtn = $('<li>', { class: 'cancel-crop' }).append('<a title="Cancel"><i class="ion-ios-close-outline"></i></a>');

	return $btns.append($cancelBtn).append($cropBtn);
}

function showCropBtns(elem) {
	let popup = createCropBtns(elem);

	elem.append(popup);

	elem.find('.confirm-crop a').on('click', cropImg);
	elem.find('.cancel-crop a').on('click', cancelCropping);
}

function cropImg(e) {
	e.preventDefault();
	e.stopPropagation();

	let $img = $('.input.thumb.img-cropping img'),
	    imgDataBase64 = $img.cropper('getCroppedCanvas') === null ? null : $img.cropper('getCroppedCanvas').toDataURL();

	if (imgCroppedData !== null) {
		let imgData = $.removeUriScheme(imgCroppedData);

		$img.attr('data-img', imgCroppedData).attr('src', imgCroppedData);
		uploadImg(imgData);
	}

	$img.parent().removeClass('img-cropping').find('.crop-btns').remove();
	$img.cropper('destroy');
}

function cancelCropping(e) {
	e.preventDefault();
	e.stopPropagation();

	let $img = $('.input.thumb.img-cropping img');

	$img.cropper('destroy');
	$img.parent().removeClass('img-cropping').find('.crop-btns').remove();
}

function doImageTask(e) {
	e.preventDefault();
	e.stopPropagation();

	let task = $(this).attr('class');

	switch (task) {
		case 'linking':
			showImgLinkModal();
			break;
		case 'cropping':
			showImgCropping();
			break;
		default:
			console.log(`Not in the tool lists: ${task}`);
	}
}

function setImgLink() {
	let $modal = $(this).parents('.modal'),
	    $input = $modal.find('input[name="img-url"]'),
	    target = $modal.attr('target-img'),
	    $targetImgContainer = $(`.canvas-container .canvas.active .input.thumb[data-id=${target}]`),
	    url = $input.val().trim(),
	    link = `<a href="${url}" target="_blank"></a>`;

	if (url === '') return;

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();

	try {
		if ($targetImgContainer.find('a').length > 0) {
			$targetImgContainer.find('a').attr('href', url);
		} else {
			$targetImgContainer.find('img').wrap(link);
			$targetImgContainer.find('a').on('click', e => {
				e.preventDefault();
			});
		}

		$modal.find('.tab.message.success [data-id="link-added"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(() => $modal.modal('hide'), hideModalAfterDuration);
	} catch (err) {
		console.log(`Cannot add image link: ${err}`);
		$modal.find('.tab.message.failed').addClass('active');
	}

	$modal.find('.single-input').removeClass('has-value');
	$input.val('');
	$modal.find('.modal-footer button').hide();
}

function removeImgLink() {
	let $modal = $(this).parents('.modal'),
	    target = $modal.attr('target-img'),
	    $targetImgContainer = $(`.canvas-container .canvas.active .input.thumb[data-id=${target}]`),
	    contents;

	if ($targetImgContainer.find('a').length <= 0) return;

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();
	contents = $targetImgContainer.find('a').contents();

	try {
		$targetImgContainer.find('a').replaceWith(contents);

		$modal.find('.tab.message.success [data-id="link-removed"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(() => $modal.modal('hide'), hideModalAfterDuration);
	} catch (err) {
		console.log(`Cannot remove image links: ${err}`);
		$modal.find('.tab.message.failed').addClass('active');
	}

	$modal.find('.modal-footer button').hide();
}

function showImgToolOptions() {
	let $tools = createToolPopup();
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
	let url = $(this).siblings('input').val();

	window.open(url);
}