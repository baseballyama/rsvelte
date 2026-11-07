import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import tippy from 'tippy.js';

var root = $.from_html(`<input/> <button>Hover me</button>`, 1);

export default function Attach02_input($$anchor, $$props) {
	$.push($$props, true);

	let content = $.state('Hello!');

	/**
	 * @param {string} content
	 * @returns {import('svelte/attachments').Attachment}
	 */
	function tooltip(content) {
		return (element) => {
			const tooltip = tippy(element, { content });

			return tooltip.destroy;
		};
	}

	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.attach(button, () => tooltip($.get(content)));
	$.bind_value(input, () => $.get(content), ($$value) => $.set(content, $$value));
	$.append($$anchor, fragment);
	$.pop();
}