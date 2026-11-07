import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploader } from "carbon-components-svelte";

var root = $.from_html(`<p data-testid="rejected-max-reason"> </p>`);
var root_1 = $.from_html(`<section data-testid="section-max"><!> <p data-testid="rejected-max-len"> </p> <!></section> <section data-testid="section-prepend"><!></section> <section data-testid="section-icon-fn"><!></section>`, 1);

export default function FileUploaderAdvancedFixture($$anchor) {
	/** @type {Array<{ file: File; reason: string }>} */
	let rejectedMax = [];

	let filesMax = [];
	let filesPrepend = [];
	let filesIcon = [];
	var fragment = root_1();
	var section = $.first_child(fragment);
	var node = $.child(section);

	FileUploader(node, {
		'data-testid': 'uploader-max',
		labelTitle: 'Max file size',
		labelDescription: 'Max 50 bytes.',
		multiple: true,
		maxFileSize: 50,
		status: 'edit',
		buttonLabel: 'Add file',
		iconDescription: 'Remove file',
		get files() {
			return filesMax;
		},

		set files($$value) {
			filesMax = $$value;
		},

		$$events: {
			rejected: (e) => {
				rejectedMax = e.detail;
			}
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);
	var node_1 = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, rejectedMax[0].reason));
			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if (rejectedMax[0]) $$render(consequent);
		});
	}

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_2 = $.child(section_1);

	FileUploader(node_2, {
		'data-testid': 'uploader-prepend',
		labelTitle: 'Prepend order',
		multiple: true,
		orderFiles: 'prepend',
		status: 'edit',
		buttonLabel: 'Add files',
		iconDescription: 'Remove file',
		get files() {
			return filesPrepend;
		},

		set files($$value) {
			filesPrepend = $$value;
		}
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_3 = $.child(section_2);

	FileUploader(node_3, {
		'data-testid': 'uploader-icon-fn',
		labelTitle: 'Custom remove label',
		status: 'edit',
		buttonLabel: 'Add file',
		iconDescription: (ctx) => `Custom remove ${ctx.fileName}`,
		get files() {
			return filesIcon;
		},

		set files($$value) {
			filesIcon = $$value;
		}
	});

	$.reset(section_2);
	$.template_effect(() => $.set_text(text, rejectedMax.length));
	$.append($$anchor, fragment);
}