import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SitePreview from '$lib/components/SitePreview.svelte';
import { CheckCircle } from 'lucide-svelte';

var root = $.from_html(`<div class="absolute inset-0 z-20 bg-black/50 flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<button class="relative overflow-hidden rounded w-full" type="button"><!> <!> <div class="absolute bottom-0 w-full px-3 py-2 z-30 bg-gray-900 bg-opacity-50 backdrop-blur-xs text-left"><span class="text-sm font-medium leading-none"> </span></div></button>`);

export default function StarterButton($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {import('$lib').Site} site
	 * @property {boolean} selected
	 * @property {any} [preview]
	 * @property {string} [append]
	 * @property {string} [style]
	 * @property {any} [src]
	 * @property {MouseEventHandler<HTMLButtonElement> } [onclick]
	 */
	/** @type {Props} */
	let preview = $.prop($$props, 'preview', 11, null),
		append = $.prop($$props, 'append', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		src = $.prop($$props, 'src', 3, null);

	var button = root_1();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			CheckCircle(node_1, { size: 32, class: 'text-white' });
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.selected) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	SitePreview(node_2, {
		get preview() {
			return preview();
		},

		get append() {
			return append();
		}
	});

	var div_1 = $.sibling(node_2, 2);
	var span = $.child(div_1);
	var text = $.only_child(span, true);

	$.reset(div_1);
	$.reset(button);
	$.template_effect(() => $.set_text(text, $$props.site.name));

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);