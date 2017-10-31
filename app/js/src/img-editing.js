const hideModalAfterDuration = 1000;

function createToolPopup() {
	let $popup = $('<ul>', {class: 'tool-popup'}),
			$tool = $('<li>').append('<a class="hyperlink" title="Hyperlink"><i class="ion-link"></i></a>');

	return $popup.append($tool);
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

function doImageTask(e) {
	e.preventDefault();
	e.stopPropagation();

	let task = $(this).attr('class');
	
	switch (task) {
		case 'hyperlink':
			showImgLinkModal();
			break;
		default:
			console.log(`not in the tool lists: ${tasl}`);
	}
}

function setImgLink() {
	let $modal = $(this).parents('.modal'),
			$input = $modal.find('input[name="img-url"]'),
			target = $modal.attr('target-img'),
			$targetImgContainer = $(`.canvas-container .canvas.active .input.thumb[data-id=${target}]`),
			url = $input.val().trim(),
			link = `<a href="${url}" target="_blank"></a>`;

	if(url === '') return;

	$modal.find('.tab.active').removeClass('active');
	$modal.find('.tab.message.success div').hide();

	try {
		if($targetImgContainer.find('a').length > 0) {
			$targetImgContainer.find('a').attr('href', url);
		} else {
			$targetImgContainer.find('img').wrap(link);
			$targetImgContainer.find('a').on('click', (e) => {
				e.preventDefault();
			});
		}

		$modal.find('.tab.message.success [data-id="link-added"]').show();
		$modal.find('.tab.message.success').addClass('active');
		setTimeout(() => $modal.modal('hide') , hideModalAfterDuration);
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