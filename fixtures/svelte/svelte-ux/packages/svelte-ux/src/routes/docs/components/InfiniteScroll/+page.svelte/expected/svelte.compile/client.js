import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InfiniteScroll, ListItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="h-[400px] p-1 overflow-auto"><!></div>`);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Per page</h2> <!> <h2>Viewport root (no overflown parent/ancestor)</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const items = Array(100).fill(null).map((x, i) => ({ name: `Item: ${i + 1}` }));
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			InfiniteScroll(node_1, {
				get items() {
					return items;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const visibleItems = $.derived(() => $$slotProps.visibleItems);
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 17, () => $.get(visibleItems), $.index, ($$anchor, item) => {
							ListItem($$anchor, {
								get title() {
									return $.get(item).name;
								}
							});
						});

						$.append($$anchor, fragment_1);
					}
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_4 = $.child(div_1);

			InfiniteScroll(node_4, {
				get items() {
					return items;
				},
				perPage: 5,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const visibleItems = $.derived(() => $$slotProps.visibleItems);
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.each(node_5, 17, () => $.get(visibleItems), $.index, ($$anchor, item) => {
							ListItem($$anchor, {
								get title() {
									return $.get(item).name;
								}
							});
						});

						$.append($$anchor, fragment_3);
					}
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			InfiniteScroll($$anchor, {
				get items() {
					return items;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const visibleItems = $.derived(() => $$slotProps.visibleItems);
						var fragment_6 = $.comment();
						var node_7 = $.first_child(fragment_6);

						$.each(node_7, 17, () => $.get(visibleItems), $.index, ($$anchor, item) => {
							ListItem($$anchor, {
								get title() {
									return $.get(item).name;
								}
							});
						});

						$.append($$anchor, fragment_6);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}