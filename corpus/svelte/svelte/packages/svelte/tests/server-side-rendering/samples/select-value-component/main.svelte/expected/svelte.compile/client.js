import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Option from './Option.svelte';

var select_content = $.from_html(`<!><!><!>`, 1);
var root = $.from_html(`<select><!></select>`);

export default function Main($$anchor) {
	var select = root();

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = select_content();
		var node = $.first_child(fragment);

		Option(node, {
			value: '',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('--Please choose an option--');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});

		var node_1 = $.sibling(node);

		Option(node_1, {
			value: 'dog',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Dog');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});

		var node_2 = $.sibling(node_1);

		Option(node_2, {
			value: 'cat',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Cat');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		$.append(anchor, fragment);
	});

	select.value = select.__value = 'dog';
	$.append($$anchor, select);
}