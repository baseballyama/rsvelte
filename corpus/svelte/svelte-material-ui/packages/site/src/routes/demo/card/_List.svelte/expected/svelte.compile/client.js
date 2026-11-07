import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card, { Content } from '@smui/card';
import List, { Item, Text } from '@smui/list';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="card-display"><div class="card-container"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _List($$anchor, $$props) {
	$.push($$props, true);

	let clicked = $.state(0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Card(node, {
		children: ($$anchor, $$slotProps) => {
			Content($$anchor, {
				get component() {
					return List;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Item(node_1, {
						onclick: () => $.update(clicked),
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('A card with a list as content.');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					$.each(node_2, 16, () => [...Array(5)].map((_v, i) => i + 1), $.index, ($$anchor, item) => {
						Item($$anchor, {
							onclick: () => $.update(clicked),
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}