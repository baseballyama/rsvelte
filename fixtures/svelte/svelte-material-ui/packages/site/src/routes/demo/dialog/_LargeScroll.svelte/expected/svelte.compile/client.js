import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _LargeScroll($$anchor) {
	let open = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Dialog(node, {
		'aria-labelledby': 'large-scroll-title',
		'aria-describedby': 'large-scroll-content',
		surface$style: 'width: 850px; max-width: calc(100vw - 32px);',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'large-scroll-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('A Brief Selection of Placeholder Text');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'large-scroll-content',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(node_3, 16, () => Array(10), $.index, ($$anchor, _item) => {
						LoremIpsum($$anchor, {});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Actions(node_4, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						action: 'accept',
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Done');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	Button(node_5, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Open Dialog');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}