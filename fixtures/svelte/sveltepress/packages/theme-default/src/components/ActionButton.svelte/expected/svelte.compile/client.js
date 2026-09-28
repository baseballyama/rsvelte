import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import External from './icons/External.svelte';
import { getPathFromBase } from './utils';

var root = $.from_html(`<div class="external-icon svelte-1t8w6jm"><!></div>`);
var root_1 = $.from_html(`<a><span class="label svelte-1t8w6jm"> </span> <!></a>`);

export default function ActionButton($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {object} Props
	 * @property {any} label - The text to display on the button
	 * @property {string} [type] - The type of the button
	 * @property {any} to - The path to navigate to
	 * @property {boolean} [external] - Whether the link is external
	 */
	/** @type {Props} */
	let type = $.prop($$props, 'type', 3, ''),
		external = $.prop($$props, 'external', 3, false);

	var a = root_1();
	var span = $.child(a);
	var text = $.only_child(span, true);
	var node = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			External(node_1, {});
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (external()) $$render(consequent);
		});
	}

	$.reset(a);

	$.template_effect(
		($0) => {
			$.set_attribute(a, 'href', $0);
			$.set_class(a, 1, `svp-action ${type() ? `svp-action--${type()}` : ''}`, 'svelte-1t8w6jm');
			$.set_attribute(a, 'target', external() ? '_blank' : '');
			$.set_text(text, $$props.label);
		},
		[() => external() ? $$props.to : getPathFromBase($$props.to)]
	);

	$.append($$anchor, a);
	$.pop();
}