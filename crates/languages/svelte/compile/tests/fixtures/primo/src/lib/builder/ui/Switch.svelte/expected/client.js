import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="primo--field-label"> </span>`);
var root_1 = $.from_html(`<div class="label-container svelte-pimk5q"><label class="svelte-pimk5q"><!> <div class="switch-container svelte-pimk5q"><input type="checkbox" class="svelte-pimk5q"/> <span class="svelte-pimk5q"></span></div></label></div>`);

export default function Switch($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {string} [label]
	 * @property {any} value
	 * @property {() => void} oninput
	 */
	/** @type {Props} */
	let label = $.prop($$props, 'label', 3, '');

	var div = root_1();
	var label_1 = $.child(div);
	var node = $.child(label_1);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, label()));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var input = $.child(div_1);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_1);
	$.reset(label_1);
	$.reset(div);
	$.template_effect(() => $.set_checked(input, $$props.value));
	$.delegated('input', input, () => $$props.oninput(!$$props.value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);