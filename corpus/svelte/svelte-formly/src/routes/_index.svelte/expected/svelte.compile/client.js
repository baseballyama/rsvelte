import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Formly } from 'svelte-formly-light';

var root = $.from_html(`<div class="grid"><div class="col"><article><p><code><i>fetch:</i><u><!></u></code></p> <!></article></div> <div class="col"><article><!></article></div></div>`);

export default function _index($$anchor) {
	let loading = false;
	const form_name = 'my_form_a';

	const fields = [
		{
			type: 'file', // required
			name: 'name-file', // require
			attributes: {
				id: 'id-field', // optional
				classes: ['form-control'], // optional
				label: 'Image' // optional
			},
			extra: { multiple: true, // optional
			 showPreview: true // optional
			 },
			rules: ['file'],
			file: {
				// need to add this attribute object if you need a file rule
				types: 'jpg,gif',
				maxsize: 5
			}
		}
	];

	const form_name_b = 'my_form_b';

	const fields_b = [
		{
			type: 'input',
			name: 'country',
			attributes: {
				type: 'text',
				id: 'country',
				classes: ['form-control'],
				placeholder: 'Tap your country'
			},
			rules: ['required'],
			messages: { required: 'The country is required' }
		}
	];

	let data = {};

	const onSubmit = ({ detail }) => {
		console.log('detail onSubmit', detail);
		data = detail;
	};

	const onUpdate = ({ detail }) => {
		console.log('detail onUpdate', detail);
		data = detail;
	};

	var div = root();
	var div_1 = $.child(div);
	var article = $.child(div_1);
	var p = $.child(article);
	var code = $.child(p);
	var u = $.sibling($.child(code));
	var node = $.child(u);

	{
		var consequent = ($$anchor) => {
			var text = $.text('loading...');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('done');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(u);
	$.reset(code);
	$.reset(p);

	var node_1 = $.sibling(p, 2);

	Formly(node_1, {
		get fields() {
			return fields;
		},
		form_name,
		realtime: true,
		$$events: { submit: onSubmit, update: onUpdate }
	});

	$.reset(article);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var article_1 = $.child(div_2);
	var node_2 = $.child(article_1);

	Formly(node_2, {
		get fields() {
			return fields_b;
		},
		form_name: form_name_b,
		realtime: true,
		$$events: { submit: onSubmit, update: onUpdate }
	});

	$.reset(article_1);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}