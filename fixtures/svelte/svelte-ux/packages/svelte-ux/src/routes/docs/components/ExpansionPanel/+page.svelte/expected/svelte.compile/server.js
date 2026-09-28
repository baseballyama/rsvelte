import * as $ from 'svelte/internal/server';
import { mdiAccount } from '@mdi/js';
import { Button, ExpansionPanel, ListItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Simple</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(Array(5));

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _ = each_array[i];

				ExpansionPanel($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);
					},

					$$slots: {
						default: true,
						trigger: ($$renderer) => {
							$$renderer.push(`<div slot="trigger" class="flex-1 p-3">Item ${$.escape(i + 1)}</div>`);
						}
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Actions</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(Array(5));

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let _ = each_array_1[i];

				ExpansionPanel($$renderer, {
					classes: { toggle: 'bg-surface-200 border-t' },
					children: ($$renderer) => {
						$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);
					},

					$$slots: {
						default: true,
						trigger: ($$renderer) => {
							$$renderer.push(`<div slot="trigger" class="flex-1 p-3">Item ${$.escape(i + 1)}</div>`);
						},

						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions" class="p-2">`);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Action 1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Action 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Disabled items</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_2 = $.ensure_array_like(Array(5));

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let _ = each_array_2[i];

				ExpansionPanel($$renderer, {
					disabled: i % 2 > 0,
					children: ($$renderer) => {
						$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);
					},

					$$slots: {
						default: true,
						trigger: ($$renderer) => {
							$$renderer.push(`<div slot="trigger" class="flex-1 p-3">Item ${$.escape(i + 1)}</div>`);
						}
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>ListItem trigger</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_3 = $.ensure_array_like(Array(5));

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let _ = each_array_3[i];

				ExpansionPanel($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);
					},

					$$slots: {
						default: true,
						trigger: ($$renderer) => {
							ListItem($$renderer, {
								slot: 'trigger',
								title: `Item ${$.stringify(i + 1)}`,
								subheading: 'List Item',
								icon: mdiAccount,
								avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
								class: 'flex-1',
								noShadow: true
							});
						}
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Mix ExpansionPanel with ListItem</h2> <h3>first and last items</h3> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ExpansionPanel($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
      omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
      Inventore laborum rerum at id?</div>`);
				},

				$$slots: {
					default: true,
					trigger: ($$renderer) => {
						ListItem($$renderer, {
							slot: 'trigger',
							title: 'Item 1',
							subheading: 'Expansion Panel',
							icon: mdiAccount,
							avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
							class: 'flex-1',
							noShadow: true
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			ListItem($$renderer, {
				title: 'Item 2',
				subheading: 'List Item',
				icon: mdiAccount,
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});

			$$renderer.push(`<!----> `);

			ExpansionPanel($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
      omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
      Inventore laborum rerum at id?</div>`);
				},

				$$slots: {
					default: true,
					trigger: ($$renderer) => {
						ListItem($$renderer, {
							slot: 'trigger',
							title: 'Item 3',
							subheading: 'Expansion Panel',
							icon: mdiAccount,
							avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
							class: 'flex-1',
							noShadow: true
						});
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Mix ExpansionPanel with ListItem</h2> <h3>middle item</h3> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ListItem($$renderer, {
				title: 'Item 1',
				subheading: 'List Item',
				icon: mdiAccount,
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});

			$$renderer.push(`<!----> `);

			ExpansionPanel($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
      omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
      Inventore laborum rerum at id?</div>`);
				},

				$$slots: {
					default: true,
					trigger: ($$renderer) => {
						ListItem($$renderer, {
							slot: 'trigger',
							title: 'Item 2',
							subheading: 'Expansion Panel',
							icon: mdiAccount,
							avatar: { class: 'bg-surface-content/50 text-surface-100/90' },
							class: 'flex-1',
							noShadow: true
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			ListItem($$renderer, {
				title: 'Item 3',
				subheading: 'List Item',
				icon: mdiAccount,
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}