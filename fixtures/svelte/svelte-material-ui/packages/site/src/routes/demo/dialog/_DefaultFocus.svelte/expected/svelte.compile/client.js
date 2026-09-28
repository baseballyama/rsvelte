import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <pre class="status"> </pre>`, 1);

export default function _DefaultFocus($$anchor) {
	let open = $.state(false);
	let response = $.state('Nothing yet.');
	var fragment = root_2();
	var node = $.first_child(fragment);

	Dialog(node, {
		'aria-labelledby': 'default-focus-title',
		'aria-describedby': 'default-focus-content',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Title(node_1, {
				id: 'default-focus-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Advice');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				id: 'default-focus-content',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Build something today, even if it sucks.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Actions(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					Button(node_4, {
						onclick: () => $.set(response, 'I will make you! Do it!'),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('You Can\'t Make Me');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => [InitialFocus]);

						Button(node_5, {
							defaultAction: true,
							get use() {
								return $.get($0);
							},
							onclick: () => $.set(response, 'It will be glorious.'),
							children: ($$anchor, $$slotProps) => {
								Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('I Will');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Button(node_6, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Open Dialog');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_6, 2);
	var text_5 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_5, `Response: ${$.get(response) ?? ''}`));
	$.append($$anchor, fragment);
}