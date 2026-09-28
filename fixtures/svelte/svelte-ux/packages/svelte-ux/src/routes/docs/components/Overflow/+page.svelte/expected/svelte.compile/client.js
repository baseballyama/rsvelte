import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Overflow, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div>Resize the window to see text truncate and watch values</div>`);
var root_1 = $.from_html(`<div> </div> <div> </div> <div class="whitespace-nowrap border rounded-lg bg-surface-100"></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Conditional tooltip</h2> <!>`, 1);

export default function _page($$anchor) {
	let overflowItems = 1;
	const text = 'This is really long text used to demonstrate overflow.';
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				variant: 'outline',
				$$events: { click: () => overflowItems += 1 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('+ item');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				variant: 'outline',
				$$events: { click: () => overflowItems -= overflowItems > 1 ? 1 : 0 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('- item');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Overflow(node_3, {
				class: 'w-1/2 h-[200px] overflow-hidden',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const overflowX = $.derived(() => $$slotProps.overflowX);
						const overflowY = $.derived(() => $$slotProps.overflowY);
						var fragment_2 = root_1();
						var div = $.first_child(fragment_2);
						var text_3 = $.only_child(div);
						var div_1 = $.sibling(div, 2);
						var text_4 = $.only_child(div_1);
						var div_2 = $.sibling(div_1, 2);

						$.each(div_2, 21, () => ({ length: overflowItems }), $.index, ($$anchor, _) => {
							var div_3 = root();

							$.append($$anchor, div_3);
						});

						$.reset(div_2);

						$.template_effect(() => {
							$.set_text(text_3, `overflowX: ${$.get(overflowX) ?? ''}`);
							$.set_text(text_4, `overflowY: ${$.get(overflowY) ?? ''}`);
						});

						$.append($$anchor, fragment_2);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Overflow($$anchor, {
				class: 'w-1/2 truncate border',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const overflowX = $.derived(() => $$slotProps.overflowX);

						{
							let $0 = $.derived(() => $.get(overflowX) > 0);

							Tooltip($$anchor, {
								title: text,
								get enabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text();

									text_5.nodeValue = 'This is really long text used to demonstrate overflow.';
									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}