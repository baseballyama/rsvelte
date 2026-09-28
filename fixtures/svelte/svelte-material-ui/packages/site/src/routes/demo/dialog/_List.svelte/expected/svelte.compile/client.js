import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import List, { Item, Text } from '@smui/list';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _List($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let clicked = $.state('Nothing yet.');
	var fragment = root_1();
	var node = $.first_child(fragment);

	Dialog(node, {
		selection: true,
		'aria-labelledby': 'list-title',
		'aria-describedby': 'list-content',
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
				id: 'list-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dialog Title');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'list-content',
				children: ($$anchor, $$slotProps) => {
					List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 16, () => [...Array(100)].map((_v, i) => i + 1), $.index, ($$anchor, item) => {
								Item($$anchor, {
									onclick: () => {
										$.set(clicked, item, true);
										$.set(open, false);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, `Item #${item ?? ''}`));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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

	var node_4 = $.sibling(node, 2);

	Button(node_4, {
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

	var pre = $.sibling(node_4, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_3, `Clicked: ${$.get(clicked) ?? ''}${$.get(clicked) === 69
		? ', nice'
		: $.get(clicked) === 42
			? ', the answer to life, the universe, and everything'
			: ''}`));

	$.append($$anchor, fragment);
	$.pop();
}