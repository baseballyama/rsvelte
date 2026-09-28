import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Button, Icon, NumberStepper } from 'svelte-ux';
import { mdiFilterVariant, mdiPlus, mdiMinus } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="value" class="bg-success text-success-content rounded-full"><!></div>`);
var root_1 = $.from_html(`<h1>Examples</h1> <!> <h2>Button</h2> <!> <h2>Button w/ small</h2> <!> <h2>Icon Button</h2> <!> <h2>Icon Button w/ small</h2> <!> <h2>Dot</h2> <!> <h2>Dot w/ small</h2> <!> <h2>Style</h2> <!> <h2>Value slot</h2> <!> <h2>Multiple</h2> <!> <h2>Placement</h2> <div class="grid grid-cols-5 gap-4"><div><h3 class="text-sm text-surface-content/50">Button w/ default</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ default</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ default</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ default</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-right</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-left</h3> <!></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-right</h3> <!></div></div>`, 1);

export default function _page($$anchor) {
	let value = 1;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	NumberStepper(node, {
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},

				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Example');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				small: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Example');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						variant: 'outline',
						class: 'p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				small: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						variant: 'outline',
						class: 'p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				dot: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						variant: 'outline',
						class: 'p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				dot: true,
				small: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						variant: 'outline',
						class: 'p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				class: 'bg-success text-success-content',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						variant: 'outline',
						class: 'p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						variant: 'outline',
						class: 'p-3'
					});
				},

				$$slots: {
					default: true,
					value: ($$anchor, $$slotProps) => {
						var div = root();
						var node_9 = $.child(div);

						Icon(node_9, {
							get data() {
								return mdiPlus;
							}
						});

						$.reset(div);
						$.append($$anchor, div);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				placement: 'bottom-right',
				get value() {
					return value;
				},
				dot: true,
				circle: true,
				class: 'bg-danger',
				children: ($$anchor, $$slotProps) => {
					Badge($$anchor, {
						placement: 'top-right',
						get value() {
							return value;
						},
						dot: true,
						circle: true,
						class: 'bg-success',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								get icon() {
									return mdiFilterVariant;
								},
								variant: 'outline',
								class: 'p-3'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_10, 4);
	var div_2 = $.child(div_1);
	var node_11 = $.sibling($.child(div_2), 2);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},

				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Example');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_12 = $.sibling($.child(div_3), 2);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				placement: 'top-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Example');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_13 = $.sibling($.child(div_4), 2);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				placement: 'top-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Example');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_14 = $.sibling($.child(div_5), 2);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				placement: 'bottom-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Example');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_15 = $.sibling($.child(div_6), 2);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				placement: 'bottom-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Example');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_16 = $.sibling($.child(div_7), 2);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				small: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Example');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_17 = $.sibling($.child(div_8), 2);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				small: true,
				placement: 'top-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Example');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_18 = $.sibling($.child(div_9), 2);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				small: true,
				placement: 'top-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Example');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_19 = $.sibling($.child(div_10), 2);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				small: true,
				placement: 'bottom-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Example');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_20 = $.sibling($.child(div_11), 2);

	Preview(node_20, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				small: true,
				placement: 'bottom-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Example');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_21 = $.sibling($.child(div_12), 2);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_22 = $.sibling($.child(div_13), 2);

	Preview(node_22, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				placement: 'top-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_23 = $.sibling($.child(div_14), 2);

	Preview(node_23, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				placement: 'top-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var node_24 = $.sibling($.child(div_15), 2);

	Preview(node_24, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				placement: 'bottom-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var node_25 = $.sibling($.child(div_16), 2);

	Preview(node_25, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				placement: 'bottom-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var node_26 = $.sibling($.child(div_17), 2);

	Preview(node_26, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				small: true,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var node_27 = $.sibling($.child(div_18), 2);

	Preview(node_27, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				small: true,
				placement: 'top-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var node_28 = $.sibling($.child(div_19), 2);

	Preview(node_28, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				small: true,
				placement: 'top-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var node_29 = $.sibling($.child(div_20), 2);

	Preview(node_29, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				small: true,
				placement: 'bottom-left',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var node_30 = $.sibling($.child(div_21), 2);

	Preview(node_30, {
		children: ($$anchor, $$slotProps) => {
			Badge($$anchor, {
				get value() {
					return value;
				},
				circle: true,
				small: true,
				placement: 'bottom-right',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						get icon() {
							return mdiFilterVariant;
						},
						class: 'border p-3'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_21);
	$.reset(div_1);
	$.append($$anchor, fragment);
}