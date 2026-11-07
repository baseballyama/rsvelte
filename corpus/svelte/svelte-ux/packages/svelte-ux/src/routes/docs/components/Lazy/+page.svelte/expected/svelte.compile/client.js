import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Lazy, ListItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="h-[400px] p-1 overflow-auto"></div>`);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Unmount</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const items = Array(100).fill(null).map((x, i) => ({ name: `Item: ${i + 1}` }));
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.each(div, 21, () => items, $.index, ($$anchor, item) => {
				Lazy($$anchor, {
					height: '40px',
					class: 'group',
					children: ($$anchor, $$slotProps) => {
						ListItem($$anchor, {
							get title() {
								return $.get(item).name;
							},
							list: 'group'
						});
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();

			$.each(div_1, 21, () => items, $.index, ($$anchor, item) => {
				Lazy($$anchor, {
					height: '40px',
					class: 'group',
					unmount: true,
					children: ($$anchor, $$slotProps) => {
						ListItem($$anchor, {
							get title() {
								return $.get(item).name;
							},
							list: 'group'
						});
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}