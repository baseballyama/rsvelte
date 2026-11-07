import * as $ from 'svelte/internal/server';
import { Formly } from 'svelte-formly-light';

export default function _index($$renderer) {
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

	$$renderer.push(`<div class="grid"><div class="col"><article><p><code><i>fetch:</i><u>`);

	if (loading) {
		$$renderer.push(`<!--[0-->loading...`);
	} else {
		$$renderer.push(`<!--[-1-->done`);
	}

	$$renderer.push(`<!--]--></u></code></p> `);
	Formly($$renderer, { fields, form_name, realtime: true });
	$$renderer.push(`<!----></article></div> <div class="col"><article>`);
	Formly($$renderer, { fields: fields_b, form_name: form_name_b, realtime: true });
	$$renderer.push(`<!----></article></div></div>`);
}