import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Breadcrumb, DividerDot, Icon } from 'svelte-ux';
import { mdiArrowRight } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<span slot="item"><div class="text-surface-content/50 text-xs uppercase"> </div> <div> </div></span>`);
var root_1 = $.from_html(`<div><div class="text-surface-content/50 text-xs uppercase"> </div> <div> </div></div>`);
var root_2 = $.from_html(`<span slot="item"><span class="text-surface-content/50 text-sm font-extrabold"> </span> <span class="text-surface-content/50 text-sm"> </span></span>`);
var root_3 = $.from_html(`<div class="bg-primary text-primary-content p-2 rounded"><!></div>`);
var root_4 = $.from_html(`<span slot="item" class="last:truncate"> </span>`);
var root_5 = $.from_html(`<div class="w-[300px] border"><!></div>`);
var root_6 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>With gap</h2> <!> <h2>Custom divider</h2> <h3>with prop</h3> <!> <h2>Custom divider</h2> <h3>with slot Icon</h3> <!> <h2>Custom item</h2> <h3>with markup</h3> <!> <h2>Custom item</h2> <h3>with Button</h3> <!> <h2>Custom item and divider</h2> <!> <h2>Many items</h2> <!> <h2>Null items (not displayed)</h2> <!> <h2>Color</h2> <h3>inherit</h3> <!> <h2>Color</h2> <h3>text class</h3> <!> <h2>Truncate long text</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let items = ['First', 'Second', 'Third'];

	let labeledItems = [
		{ label: 'First', value: 'One' },
		{ label: 'Second', value: 'Two' },
		{ label: 'Third', value: 'Three' }
	];

	var fragment = root_6();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return items;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return items;
				},
				class: 'gap-1'
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 6);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return items;
				},
				divider: '/',
				class: 'gap-2'
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 6);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return items;
				},
				class: 'gap-2',
				$$slots: {
					divider: ($$anchor, $$slotProps) => {
						Icon($$anchor, {
							slot: 'divider',
							get path() {
								return mdiArrowRight;
							},
							class: 'text-surface-content/25'
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 6);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return labeledItems;
				},
				class: 'gap-2',
				$$slots: {
					item: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						var span = root();
						var div = $.child(span);
						var text = $.only_child(div, true);
						var div_1 = $.sibling(div, 2);
						var text_1 = $.only_child(div_1, true);

						$.reset(span);

						$.template_effect(() => {
							$.set_text(text, $.get(item).label);
							$.set_text(text_1, $.get(item).value);
						});

						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 6);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return labeledItems;
				},

				$$slots: {
					item: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);

						Button($$anchor, {
							slot: 'item',
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									var div_2 = root_1();
									var div_3 = $.child(div_2);
									var text_2 = $.only_child(div_3, true);
									var div_4 = $.sibling(div_3, 2);
									var text_3 = $.only_child(div_4, true);

									$.reset(div_2);

									$.template_effect(() => {
										$.set_text(text_2, $.get(item).label);
										$.set_text(text_3, $.get(item).value);
									});

									$.append($$anchor, div_2);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return labeledItems;
				},
				class: 'gap-2',
				$$slots: {
					item: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						var span_1 = root_2();
						var span_2 = $.child(span_1);
						var text_4 = $.only_child(span_2);
						var span_3 = $.sibling(span_2, 2);
						var text_5 = $.only_child(span_3, true);

						$.reset(span_1);

						$.template_effect(() => {
							$.set_text(text_4, `${$.get(item).label ?? ''}:`);
							$.set_text(text_5, $.get(item).value);
						});

						$.append($$anchor, span_1);
					},

					divider: ($$anchor, $$slotProps) => {
						DividerDot($$anchor, { slot: 'divider', class: 'text-surface-content/50' });
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => Array.from({ length: 20 }).map((_, i) => 'Item ' + ++i));

				Breadcrumb($$anchor, {
					get items() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => Array.from({ length: 10 }).map((_, i) => i % 2 ? null : 'Item ' + ++i));

				Breadcrumb($$anchor, {
					get items() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 6);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_3();
			var node_10 = $.child(div_5);

			Breadcrumb(node_10, {
				get items() {
					return items;
				}
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_9, 6);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			Breadcrumb($$anchor, {
				get items() {
					return items;
				},
				class: 'text-primary'
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_5();
			var node_13 = $.child(div_6);

			Breadcrumb(node_13, {
				items: ['Example', 'of', 'really really really long text'],
				class: 'flex-nowrap',
				$$slots: {
					item: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						var span_4 = root_4();
						var text_6 = $.only_child(span_4, true);

						$.template_effect(() => {
							$.set_attribute(span_4, 'title', $.get(item));
							$.set_text(text_6, $.get(item));
						});

						$.append($$anchor, span_4);
					}
				}
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}