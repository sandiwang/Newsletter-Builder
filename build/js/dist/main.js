/*
let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});
*/

/***** example to get download link of a image *****/
//const piglet = storageRef.child('images/piglet.png');
//piglet.getDownloadURL().then((url) => {
//	console.log(url);
//});

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
};

function updateContent() {
	let content = $('.editor-popup').summernote('code');

	// if user is editing on titles, only allow plain text
	if ($('.input.active').hasClass('input-no-style')) {
		content = content.replace(/<\/?[^>]+(>|$)/g, "");
	}

	$('.input.active').html(content);
	modifyStyles($('.input.active'));
}

let styleConfig = {
	fontFamily: '"KievitOT", Verdana, Geneva, sans-serif',
	fontBig: '20px',
	fontSmall: '12px',
	linkColor: '#0091ea'
};

function styleParagraph(elem) {
	return elem.find('p').css({
		'margin': '0 0 5px 0'
	});
}

function styleLink(elem) {
	elem.find('a').each(function () {
		let elemStyle = {
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
		height: 300,
		maxHeight: 250,
		toolbar: [
		// [groupName, [list of button]]
		['style', ['bold', 'italic', 'underline']], ['font', ['strikethrough', 'superscript', 'subscript']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol']], ['link', ['link']], ['submit', ['save']]],
		buttons: {
			save: SaveBtn
		}
	});
}

function destroyTextEditor() {
	$('.editor-popup').summernote('destroy');
	$('.editor-popup').html('');
}

function showTextEditorPopup() {
	$('.canvas-container').css({
		width: '80%',
		'margin-left': '20%'
	});

	$('.note-editor.panel').animate({
		left: '20px'
	}, 150);
}

function hideTextEditorPopup() {
	$('.canvas-container').css({
		width: '100%',
		'margin-left': '0'
	});

	$('.note-editor.panel').animate({
		left: '-100%'
	}, 150, () => {
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

$(function () {
	$('.input.thumb').each(function () {
		$(this).fileDrop({
			onFileRead: files => {
				$('.thumb.active').find('img').attr('src', files[0].data);

				let base64data = $.removeUriScheme(files[0].data);
				uploadImg(base64data);
			},
			overClass: 'img-dragging',
			removeDataUriScheme: true
		});
	});

	$('.export').on('click', () => {
		const windowUrl = 'about:blank';

		let content = document.querySelector('.canvas'),
		    printWindow = window.open(windowUrl, 'gNYC Newsletter');

		printWindow.document.write('<html><head><title>gNYC Newsletter</title></head><body>' + content.innerHTML + "</body>");
	});

	$('.input:not(.thumb)').on('click', toggleEditing);
	$('.input a').on('click', e => e.stopPropagation());
	$('.input.thumb').on('click', toggleImgUploadUI);
});