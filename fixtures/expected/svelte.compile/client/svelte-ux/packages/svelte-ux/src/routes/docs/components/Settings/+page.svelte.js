import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Menu, MenuItem, Settings, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`Click me <!>`, 1);
var root_2 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Settings($$anchor, {
				components: {
					Button: { classes: 'border-2 font-bold' },
					Menu: { classes: 'shadow-xl border-gray-500' },
					MenuItem: { classes: 'font-bold' }
				},

				children: ($$anchor, $$slotProps) => {
					Toggle($$anchor, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);

								Button($$anchor, {
									variant: 'outline',
									color: 'primary',
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root_1();
										var node_1 = $.sibling($.first_child(fragment_4));

										Menu(node_1, {
											get open() {
												return $.get(open);
											},

											$$events: {
												close: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_2 = $.first_child(fragment_5);

												MenuItem(node_2, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Refresh');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});

												var node_3 = $.sibling(node_2, 2);

												MenuItem(node_3, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Settings');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												var node_4 = $.sibling(node_3, 2);

												MenuItem(node_4, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Help');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												var node_5 = $.sibling(node_4, 2);

												MenuItem(node_5, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Sign In');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});

												var node_6 = $.sibling(node_5, 2);

												MenuItem(node_6, {
													disabled: true,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Disabled');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}