import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { watch } from 'runed';
import { loadIcon, buildIcon } from '@iconify/svelte';
import IconPicker from '../components/IconPicker.svelte';

var root = $.from_html(`<p class="primo--field-label"> </p>`);
var root_1 = $.from_html(`<div class="IconPicker"><!> <!></div>`);

export default function IconField($$anchor, $$props) {
	$.push($$props, true);

	let search_query = $.prop($$props, 'search_query', 3, '');
	const value = $.derived(() => $$props.entry?.value ?? '');

	// ensure value is valid
	watch(() => $.get(value), () => {
		if (!$.get(value).startsWith('<svg')) {
			$$props.onchange({ [$$props.field.key]: { 0: { value: '' } } });
		}
	});

	async function select_icon(icon) {
		// delete icon
		if (!icon) {
			$$props.onchange({ [$$props.field.key]: { 0: { value: '' } } });

			return;
		}

		// select icon
		const icon_data = await loadIcon(icon);

		if (icon_data) {
			const { attributes } = buildIcon(icon_data);
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" data-key="${$$props.field.key}" data-icon="${icon}" aria-hidden="true" role="img" height="${attributes.height}" width="${attributes.width}" viewBox="${attributes.viewBox}">${icon_data.body}</svg>`;

			$$props.onchange({ [$$props.field.key]: { 0: { value: svg } } });
		}
	}

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $$props.field.label));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.field.label) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	IconPicker(node_1, {
		get svg_preview() {
			return $.get(value);
		},

		get search_query() {
			return search_query();
		},
		$$events: { input: ({ detail: icon }) => select_icon(icon) }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}