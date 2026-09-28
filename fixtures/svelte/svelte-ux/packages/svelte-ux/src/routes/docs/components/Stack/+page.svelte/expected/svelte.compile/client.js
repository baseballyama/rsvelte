import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiFilterVariant } from '@mdi/js';
import { Button, SectionDivider, Stack } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`, 1);
var root_1 = $.from_html(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`, 1);
var root_2 = $.from_html(`<!> <div class="bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center">3</div>`, 1);
var root_3 = $.from_html(`<!> <div class="bg-danger rounded-full h-4 w-4 -mr-1 -mt-1 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div>`, 1);
var root_4 = $.from_html(`<!> <div class="bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div>`, 1);
var root_5 = $.from_html(`<!> <div class="bg-danger rounded-full h-4 w-4 -mt-1 text-xs flex items-center justify-center self-start justify-self-end border border-surface-100"></div> <div class="bg-success rounded-full h-4 w-4 text-xs flex items-center justify-center self-end justify-self-end border border-surface-100"></div>`, 1);
var root_6 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Gap</h2> <!> <h2>Justify</h2> <!> <!> <!> <h2>Template</h2> <!> <!> <h2>Default</h2> <!> <h2>Gap</h2> <!> <h2>Justify</h2> <!> <!> <!> <h2>Template</h2> <!> <!> <h2>Default</h2> <!> <h2>Corner with Button</h2> <!> <h2>Corner with Icon Button</h2> <!> <h2>Corner (multi) with Icon Button</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_6();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				horizontal: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(10);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				horizontal: true,
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();

					$.next(10);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				horizontal: true,
				justify: 'start',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();

					$.next(10);
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				horizontal: true,
				justify: 'center',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();

					$.next(10);
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				horizontal: true,
				justify: 'end',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();

					$.next(10);
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				horizontal: true,
				template: 'auto 1fr auto',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_1();

					$.next(4);
					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	SectionDivider(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Vertical');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				vertical: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root();

					$.next(10);
					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				vertical: true,
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_16 = root();

					$.next(10);
					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				vertical: true,
				justify: 'start',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root();

					$.next(10);
					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				vertical: true,
				justify: 'center',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_20 = root();

					$.next(10);
					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				vertical: true,
				justify: 'end',
				gap: 8,
				children: ($$anchor, $$slotProps) => {
					var fragment_22 = root();

					$.next(10);
					$.append($$anchor, fragment_22);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				vertical: true,
				template: 'auto 1fr auto',
				gap: 8,
				class: 'h-64',
				children: ($$anchor, $$slotProps) => {
					var fragment_24 = root_1();

					$.next(4);
					$.append($$anchor, fragment_24);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	SectionDivider(node_13, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Stack');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				stack: true,
				inline: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_26 = root_2();
					var node_15 = $.first_child(fragment_26);

					Button(node_15, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Example');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_26);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_14, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				stack: true,
				inline: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_28 = root_3();
					var node_17 = $.first_child(fragment_28);

					Button(node_17, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Example');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_28);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_16, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				stack: true,
				inline: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_30 = root_4();
					var node_19 = $.first_child(fragment_30);

					Button(node_19, {
						variant: 'outline',
						get icon() {
							return mdiFilterVariant;
						},
						class: 'p-3'
					});

					$.next(2);
					$.append($$anchor, fragment_30);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_18, 4);

	Preview(node_20, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				stack: true,
				inline: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_32 = root_5();
					var node_21 = $.first_child(fragment_32);

					Button(node_21, {
						variant: 'outline',
						get icon() {
							return mdiFilterVariant;
						},
						class: 'p-3'
					});

					$.next(4);
					$.append($$anchor, fragment_32);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}