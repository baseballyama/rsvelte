import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> `, 1);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [message]
	 * @property {import('svelte').Snippet<[any]>} [extra]
	 */
	/** @type {Props & { [key: string]: any }} */
	let props = $.rest_props($$props, rest_excludes);

	let showMessage = $$props.message;
	let extraTitle = $.derived(() => $$props.extra);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.message ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (showMessage) $$render(consequent);
		});
	}

	var text = $.sibling(node);

	$.template_effect(() => $.set_text(text, ` ${props ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}