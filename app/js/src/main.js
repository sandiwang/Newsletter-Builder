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
	  ['fontsize', ['fontsize']],
	  ['color', ['color']],
	  ['para', ['ul', 'ol']],
	  ['link', ['link', 'picture']],
	  ['cancel', ['cancel']],
	  ['submit', ['save']]
	]
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
	fontSmall: '12px',
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
	  }
	});
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

$(function(){
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

	$('.export').on('click', exportNewsletter);

	$('.input:not(.thumb)').on('click', toggleEditing);
	$('.input a').on('click', (e) => e.stopPropagation());

	$('.input.thumb').on('click', toggleImgUploadUI);
	$('.input.thumb').hover(showImgToolOptions, hideImgToolOptions);

	$('.templates li').on('click', changeTemplate);

	$('#setImgLink').on('click', setImgLink);
	$('#removeImgLink').on('click', removeImgLink);
	$('#img-linking-modal .tab.message.failed .sub-message').on('click', showImgUrlForm);
	$('#test-link').on('click', testLinkUrl);
});

