import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import tippy from 'tippy.js';
import Button from './Button.svelte';

var root = $.from_html(`<input/> <!>`, 1);

export default function Attach04_input($$anchor, $$props) {
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

	var node = $.sibling(input, 2);

	Button(node, {
		[$.attachment()]: ($$node) => (tooltip($.get(content)) || $.noop)($$node),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hover me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.bind_value(input, () => $.get(content), ($$value) => $.set(content, $$value));
	$.append($$anchor, fragment);
	$.pop();
}