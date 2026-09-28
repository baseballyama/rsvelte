import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Formly } from '$lib';

var root = $.from_html(`<div class="grid"><div class="col"><article><hgroup><h1>Sign in</h1> <h2>Nibh risus velit metus euismod vitae eu urna.</h2></hgroup> <!></article></div></div>`);

export default function Routes($$anchor) {
	// import { Formly, type IField } from 'svelte-formly-light';
	const form_name = 'my_form_a';

	const fields = [
		{
			type: 'autocomplete', // required
			name: 'name-field-autocomplete', // required
			attributes: {
				id: 'id-field-autocomplete',
				classes: ['class1', 'class2'],
				placeholder: 'Tap keyword...',
				autocomplete: 'off'
			},
			extra: {
				filter_length: 2,
				loadItemes: [
					// list items with id and title attributes.
					{ value: 1, title: 'item 1' },
					{ value: 2, title: 'item 2' },
					{ value: 3, title: 'item 3' },
					{ value: 4, title: 'item 4' }
				]
			}
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
	var node = $.sibling($.child(article), 2);

	Formly(node, {
		get fields() {
			return fields;
		},
		form_name,
		realtime: false,
		$$events: { submit: onSubmit, update: onUpdate }
	});

	$.reset(article);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}