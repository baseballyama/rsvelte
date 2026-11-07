import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AppBar, Button, ListItem } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import { mdiRefresh, mdiChevronRight, mdiMicrosoftXboxControllerMenu } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="title"><!></div>`);
var root_1 = $.from_html(`<div slot="actions"><!></div>`);
var root_2 = $.from_html(`<div class="grid gap-2"><!> <!></div>`);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Title as string</h2> <!> <h2>Title as array</h2> <!> <h2>Title as slot</h2> <!> <h2>Actions</h2> <!> <h2>Color</h2> <!> <h2>menuIcon prop</h2> <!> <h2>menuIcon slot</h2> <!> <h2>remove icon</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, { title: 'Example' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, { title: ['One', 'Two', 'Three'] });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, {
				title: 'Example (shown in window title)',
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var div = root();
						var node_4 = $.child(div);

						ListItem(node_4, { title: 'Example', subheading: 'Subheading' });
						$.reset(div);
						$.append($$anchor, div);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_3, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, {
				title: 'Example',
				$$slots: {
					actions: ($$anchor, $$slotProps) => {
						var div_1 = root_1();
						var node_6 = $.child(div_1);

						Button(node_6, {
							get icon() {
								return mdiRefresh;
							},
							class: 'p-2 hover:bg-surface-100/10'
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_2();
			var node_8 = $.child(div_2);

			AppBar(node_8, { title: 'Example', class: 'bg-primary text-primary-content' });

			var node_9 = $.sibling(node_8, 2);

			AppBar(node_9, { title: 'Example', class: 'bg-blue-500 text-primary-content' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, {
				title: 'Example',
				get menuIcon() {
					return mdiMicrosoftXboxControllerMenu;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, {
				title: 'Example',
				$$slots: {
					menuIcon: ($$anchor, $$slotProps) => {
						const toggleMenu = $.derived(() => $$slotProps.toggleMenu);
						const isMenuOpen = $.derived(() => $$slotProps.isMenuOpen);

						{
							let $0 = $.derived(() => cls('p-3 transition-transform', $.get(isMenuOpen) && 'rotate-180'));

							Button($$anchor, {
								get icon() {
									return mdiChevronRight;
								},

								get class() {
									return $.get($0);
								},

								$$events: {
									click: function (...$$args) {
										$.get(toggleMenu)?.apply(this, $$args);
									}
								}
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			AppBar($$anchor, { title: 'Example', menuIcon: null });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}