import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, PaginationNav, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <div><strong>Current page:</strong> </div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function PaginationNavReactive($$anchor) {
	let page = 2;

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			PaginationNav(node, {
				get page() {
					return page;
				},

				set page($$value) {
					page = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			Stack(node_1, {
				gap: 4,
				orientation: 'horizontal',
				align: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => page === 0);

						Button(node_2, {
							kind: 'tertiary',
							size: 'small',
							get disabled() {
								return $.get($0);
							},
							$$events: { click: () => page = 1 },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Set page to 1');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					var div = $.sibling(node_2, 2);
					var text_1 = $.sibling($.child(div));

					$.reset(div);
					$.template_effect(() => $.set_text(text_1, ` ${page ?? ''}`));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}