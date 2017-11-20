const hideModalAfterDuration = 1000;
const icons = {
	linking: 'ion-ios-infinite-outline',
	cropping: 'ion-ios-crop',
	close: 'ion-ios-close-outline',
	cropRound: 'ion-ios-ionic-outline',
	delete: 'ion-ios-trash-outline',
	upload: 'ion-ios-cloud-upload-outline'
}

let imgCroppedData = {
	dataURL: null,
	data: null
};

function createToolPopup() {
	let $popup = $('<ul>', {class: 'tool-popup'}),
			$linking = $('<li>').append(`<a class="linking" title="Hyperlink"><i class="${icons.linking}"></i></a>`),
			$cropping = $('<li>').append(`<a class="cropping" title="Crop Image"><i class="${icons.cropping}"></i></a>`),
			$delete = $('<li>').append(`<a class="delete" title="Delete"><i class="${icons.delete}"></i></a>`),
			$upload = $('<li>').append(`<a class="upload" title="Upload Image"><i class="${icons.upload}"></i></a>`);;

	return $popup.append($upload).append($linking).append($cropping).append($delete);
}

function createCropBtns(){
	let $btns = $('<ul>', {class: 'crop-btns'}),
			$cancelBtn = $('<li>', {class: 'cancel-crop'}).append(`<a title="Cancel"><i class="${icons.close}"></i></a>`),
			$cropRoundedBtn = $('<li>', {class: 'toggle-crop-rounded'}).append(`<a title="Rounded Crop Box"><i class="${icons.cropRound}"></i></a>`),
			$cropBtn = $('<li>', {class: 'confirm-crop'}).append(`<a title="Crop Image"><i class="${icons.cropping}"></i></a>`);
			

	return $btns.append($cancelBtn).append($cropRoundedBtn).append($cropBtn);
}

function selectImgFromFiles() {
	let $img = $('.input.thumb.hovering').find('img'),
			$input = $img.siblings('input[type=file]');

	$img.attr('img-data', '');
	$input.on('click', (e) => e.stopPropagation());
	$input.on('change', confirmSelectedImgFromFiles);
	$input.click();
}

function confirmSelectedImgFromFiles(e) {
	let file = e.target.files[0],
			fileType = file.type,
			userID = getCurrentUserID();

	// if it's not image, return
	if(fileType.indexOf('image') === -1) return;

	$(this).parents('.thumb').addClass('uploadingFromFiles');
	uploadImgFromFiles(userID, file).then((result) => console.log(`upload: ${result}`));
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

	if($('.input.thumb.hovering').children('a').length > 0) {
		populateCurrentLink($('.input.thumb.hovering'));
	} else {
		clearCurrentLink();
	}

	$('#img-linking-modal').attr('target-img', imgContainer).modal('show');
}

function toggleRoundedCropBox(e) {
	let $imgContainer = $('.input.thumb.img-cropping');

	e.preventDefault();
	e.stopPropagation();

	$imgContainer.toggleClass('crop-rounded');
}

function showImgCropping() {
	
	let $img = $('.input.thumb.hovering').find('img'),
			imgData = $img.attr('img-data') || $img.attr('img-url') || null;

	if(imgData) $img.attr('src', imgData);

	$img.cropper({
	  aspectRatio: 1 / 1,
	  viewMode: 1,
	  minContainerWidth: 135,
	  minContainerHeight: 135,
	  movable: true,
	  autoCropArea: 0,
	  checkCrossOrigin: true,
	  built: () => {
	  	//$img.cropper("setCropBoxData", { width: "135", height: "135" })
	  },
	  crop: (e) => {
	    // Output the result data for cropping image.
	    // console.log(e.x);
	    // console.log(e.y);
	    imgCroppedData.dataURL = $img.cropper('getCroppedCanvas').toDataURL();
	    imgCroppedData.data = $img.cropper('getCroppedCanvas');
	  }
	});

	$img.on('ready', () => {
		$img.cropper("setCropBoxData", { width: "135", height: "135" });

		$img.parent().addClass('img-cropping');
		$('.cropper-container').on('click', (e) => e.stopPropagation() );
		showCropBtns($img.parent());
	});
}

function showCropBtns(elem){
	let popup = createCropBtns(elem);

	elem.append(popup);

	elem.find('.confirm-crop a').on('click', cropImg);
	elem.find('.cancel-crop a').on('click', cancelCropping);
	elem.find('.toggle-crop-rounded a').on('click', toggleRoundedCropBox);
}

function cropImg(e){
	e.preventDefault();
	e.stopPropagation();

	let $img = $('.input.thumb.img-cropping img'),
			rounded = $img.parent().hasClass('crop-rounded') ? 1 : 0,
			imgData,
			uploadingImg;
	//imgDataBase64 = $img.cropper('getCroppedCanvas') === null ? null : $img.cropper('getCroppedCanvas').toDataURL();

	if(imgCroppedData.data === null) {
		$img.cropper('destroy');
		return;
	}

	if(rounded) {
		imgData = getRoundedCanvas(imgCroppedData.data);

		$img.attr('data-img', imgData.toDataURL()).attr('src', imgData.toDataURL());
		uploadingImg = uploadImg($.removeUriScheme(imgData.toDataURL()));

		$img.parent().removeClass('crop-rounded')
	} else {
		imgData = $.removeUriScheme(imgCroppedData.dataURL);

		$img.attr('data-img', imgCroppedData.dataURL).attr('src', imgCroppedData.dataURL);
		uploadingImg = uploadImg(imgData)
	}

	uploadingImg.then((result) => {
		if(result) doAutosave();
	});

	//$img.parent().removeClass('img-cropping').find('.crop-btns').remove();
	$img.cropper('destroy');
}

function getRoundedCanvas(data) {
	const canvas = document.createElement('canvas');
	const width = data.width;
  const height = data.height;
  let context = canvas.getContext('2d');

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

	let $img = $('.input.thumb.img-cropping img');

	$img.cropper('destroy');
	$img.parent().removeClass('img-cropping').find('.crop-btns').remove();
}

function doImgDelete(e) {
	e.preventDefault();
	e.stopPropagation();

	let $overlay = $(this).parents('.delete-img-overlay'),
			$img = $overlay.siblings('img'),
			placeholder = 'img/upload-img.png';

	$img.attr('src', placeholder).attr('img-data', '').attr('img-url', '');
	$overlay.remove();
	doAutosave();
}

function cancelImgDelete(e) {
	e.preventDefault();
	e.stopPropagation();

	let $overlay = $(this).parents('.delete-img-overlay');

	$overlay.remove();
}

function deleteCurrentImg() {
	let $img = $('.input.thumb.hovering').find('img'),
			currImg = $img.attr('src'),
			placeholder = 'img/upload-img.png',
			$overlay = $('<div>', {class: 'delete-img-overlay'}),
			$btns = $('<div>'),
			$deleteBtn = $('<span>', {class: 'delete'}).html('Delete'),
			$cancelBtn = $('<span>', {class: 'cancel'}).html('Cancel');

	if(currImg === placeholder) return;

	$btns.append($deleteBtn).append('<br>').append($cancelBtn);
	$overlay.append($btns);
	$img.parent().append($overlay);

	$deleteBtn.on('click', doImgDelete);
	$cancelBtn.on('click', cancelImgDelete);

	// $img.attr('src', placeholder).attr('img-data', '').attr('img-url', '');
}

function doImageTask(e) {
	e.preventDefault();
	e.stopPropagation();

	let task = $(this).attr('class');
	
	switch (task) {
		case 'upload':
			selectImgFromFiles();
			break;
		case 'linking':
			showImgLinkModal();
			break;
		case 'cropping':
			showImgCropping();
			break;
		case 'delete':
			deleteCurrentImg();
			break;
		default:
			console.log(`Not in the tool lists: ${task}`);
	}
}

function setImgLink() {
	let $modal = $(this).parents('.modal'),
			$input = $modal.find('input[name="img-url"]'),
			type = $input.attr('link-type'),
			target = $modal.attr('target-img'),
			$targetImgContainer = $(`.canvas-container .canvas.active .input.thumb[data-id=${target}]`),
			url = $input.val().trim(),
			link = `<a href="${url}" target="_blank"></a>`;

	if(url === '') return;

	if(type === 'file') {
		url = `file:///${url}`;
	} else if (type === 'email') {
		url = `mailto:${url}`;
	}

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();

	try {
		if($targetImgContainer.find('a').length > 0) {
			if(type === 'email') {
				$targetImgContainer.find('a').attr('target', '_self');
			} else {
				$targetImgContainer.find('a').attr('target', '_blank');
			}

			$targetImgContainer.find('a').attr('href', url);
		} else {
			if(type === 'email') {
				$targetImgContainer.find('img').wrap(`<a href="${url}" target="_self"></a>`);
			} else {
				$targetImgContainer.find('img').wrap(`<a href="${url}" target="_blank"></a>`);
			}
			$targetImgContainer.find('a').on('click', (e) => {
				e.preventDefault();
			});
		}

		$modal.find('.tab.message.success [data-id="link-added"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(() => $modal.modal('hide') , hideModalAfterDuration);
		doAutosave();
	}
	catch (err) {
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

	if($targetImgContainer.find('a').length <= 0) return;

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();
	contents = $targetImgContainer.find('a').contents();

	try {
		$targetImgContainer.find('a').replaceWith(contents);

		$modal.find('.tab.message.success [data-id="link-removed"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(() => $modal.modal('hide') , hideModalAfterDuration);
		doAutosave();
	}
	catch (err) {
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