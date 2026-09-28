import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, Icon } from 'svelte-ux';
import { mdiAccount } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Color</h2> <!> <h2>Border</h2> <!> <h2>Size</h2> <!> <h2>Icon (prop)</h2> <!> <h2>Icon (slot)</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Avatar($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('A');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Avatar($$anchor, {
				class: 'bg-primary text-primary-content font-bold',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('A');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Avatar($$anchor, {
				class: 'border',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('A');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Avatar(node_4, {
				class: 'bg-primary text-primary-content font-bold text-xs',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('sm');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Avatar(node_5, {
				class: 'bg-primary text-primary-content font-bold',
				size: 'md',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('md');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Avatar(node_6, {
				class: 'bg-primary text-primary-content font-bold',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('lg');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_3, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			Avatar($$anchor, {
				class: 'bg-primary text-primary-content',
				get icon() {
					return mdiAccount;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			Avatar($$anchor, {
				class: 'bg-primary',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						get data() {
							return mdiAccount;
						},
						class: 'text-primary-content'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}