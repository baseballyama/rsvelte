import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiAccount } from '@mdi/js';
import { Button, ExpansionPanel, ListItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);

var root_1 = $.from_html(`<div slot="trigger" class="flex-1 p-3"></div>`);
var root_2 = $.from_html(`<div slot="actions" class="p-2"><!> <!></div>`);

var root_3 = $.from_html(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
      omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
      Inventore laborum rerum at id?</div>`);

var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<h1>Examples</h1> <h2>Simple</h2> <!> <h2>Actions</h2> <!> <h2>Disabled items</h2> <!> <h2>ListItem trigger</h2> <!> <h2>Mix ExpansionPanel with ListItem</h2> <h3>first and last items</h3> <!> <h2>Mix ExpansionPanel with ListItem</h2> <h3>middle item</h3> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_5();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 16, () => Array(5), $.index, ($$anchor, _, i) => {
				ExpansionPanel($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var div = root();

						$.append($$anchor, div);
					},

					$$slots: {
						default: true,
						trigger: ($$anchor, $$slotProps) => {
							var div_1 = root_1();

							div_1.textContent = `Item ${i + 1}`;
							$.append($$anchor, div_1);
						}
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.each(node_3, 16, () => Array(5), $.index, ($$anchor, _, i) => {
				ExpansionPanel($$anchor, {
					classes: { toggle: 'bg-surface-200 border-t' },
					children: ($$anchor, $$slotProps) => {
						var div_2 = root();

						$.append($$anchor, div_2);
					},

					$$slots: {
						default: true,
						trigger: ($$anchor, $$slotProps) => {
							var div_3 = root_1();

							div_3.textContent = `Item ${i + 1}`;
							$.append($$anchor, div_3);
						},

						actions: ($$anchor, $$slotProps) => {
							var div_4 = root_2();
							var node_4 = $.child(div_4);

							Button(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Action 1');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Button(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Action 2');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.append($$anchor, div_4);
						}
					}
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_2, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = $.comment();
			var node_7 = $.first_child(fragment_5);

			$.each(node_7, 16, () => Array(5), $.index, ($$anchor, _, i) => {
				ExpansionPanel($$anchor, {
					disabled: i % 2 > 0,
					children: ($$anchor, $$slotProps) => {
						var div_5 = root();

						$.append($$anchor, div_5);
					},

					$$slots: {
						default: true,
						trigger: ($$anchor, $$slotProps) => {
							var div_6 = root_1();

							div_6.textContent = `Item ${i + 1}`;
							$.append($$anchor, div_6);
						}
					}
				});
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = $.comment();
			var node_9 = $.first_child(fragment_7);

			$.each(node_9, 16, () => Array(5), $.index, ($$anchor, _, i) => {
				ExpansionPanel($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var div_7 = root();

						$.append($$anchor, div_7);
					},

					$$slots: {
						default: true,
						trigger: ($$anchor, $$slotProps) => {
							ListItem($$anchor, {
								slot: 'trigger',
								title: `Item ${i + 1}`,
								subheading: 'List Item',
								get icon() {
									return mdiAccount;
								},
								avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
								class: 'flex-1',
								noShadow: true
							});
						}
					}
				});
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 6);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_4();
			var node_11 = $.first_child(fragment_10);

			ExpansionPanel(node_11, {
				children: ($$anchor, $$slotProps) => {
					var div_8 = root_3();

					$.append($$anchor, div_8);
				},

				$$slots: {
					default: true,
					trigger: ($$anchor, $$slotProps) => {
						ListItem($$anchor, {
							slot: 'trigger',
							title: 'Item 1',
							subheading: 'Expansion Panel',
							get icon() {
								return mdiAccount;
							},
							avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
							class: 'flex-1',
							noShadow: true
						});
					}
				}
			});

			var node_12 = $.sibling(node_11, 2);

			ListItem(node_12, {
				title: 'Item 2',
				subheading: 'List Item',
				get icon() {
					return mdiAccount;
				},
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});

			var node_13 = $.sibling(node_12, 2);

			ExpansionPanel(node_13, {
				children: ($$anchor, $$slotProps) => {
					var div_9 = root_3();

					$.append($$anchor, div_9);
				},

				$$slots: {
					default: true,
					trigger: ($$anchor, $$slotProps) => {
						ListItem($$anchor, {
							slot: 'trigger',
							title: 'Item 3',
							subheading: 'Expansion Panel',
							get icon() {
								return mdiAccount;
							},
							avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
							class: 'flex-1',
							noShadow: true
						});
					}
				}
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_10, 6);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_4();
			var node_15 = $.first_child(fragment_13);

			ListItem(node_15, {
				title: 'Item 1',
				subheading: 'List Item',
				get icon() {
					return mdiAccount;
				},
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});

			var node_16 = $.sibling(node_15, 2);

			ExpansionPanel(node_16, {
				children: ($$anchor, $$slotProps) => {
					var div_10 = root_3();

					$.append($$anchor, div_10);
				},

				$$slots: {
					default: true,
					trigger: ($$anchor, $$slotProps) => {
						ListItem($$anchor, {
							slot: 'trigger',
							title: 'Item 2',
							subheading: 'Expansion Panel',
							get icon() {
								return mdiAccount;
							},
							avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
							class: 'flex-1',
							noShadow: true
						});
					}
				}
			});

			var node_17 = $.sibling(node_16, 2);

			ListItem(node_17, {
				title: 'Item 3',
				subheading: 'List Item',
				get icon() {
					return mdiAccount;
				},
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}