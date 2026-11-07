import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ScrollContainer } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			ScrollContainer($$anchor, {
				class: 'scroll-mt-6 scroll-mb-6',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const scrollIntoView = $.derived(() => $$slotProps.scrollIntoView);
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						Button(node_1, {
							variant: 'fill',
							color: 'primary',
							$$events: { click: () => $.get(scrollIntoView)({ block: 'end' }) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Scroll to bottom');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 16, () => ({ length: 100 }), $.index, ($$anchor, _, i) => {
							var div = root();

							div.textContent = `Item: ${i + 1}`;
							$.append($$anchor, div);
						});

						var node_3 = $.sibling(node_2, 2);

						Button(node_3, {
							variant: 'fill',
							color: 'primary',
							$$events: { click: () => $.get(scrollIntoView)() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Scroll to top');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}