'use strict';

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