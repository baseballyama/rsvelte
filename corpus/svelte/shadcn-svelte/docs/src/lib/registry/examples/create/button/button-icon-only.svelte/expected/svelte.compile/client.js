import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div>`, 1);

export default function Button_icon_only($$anchor) {
	Example($$anchor, {
		title: 'Icon Only',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Button(node, {
				size: 'icon-xs',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				size: 'icon-xs',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				size: 'icon-xs',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				size: 'icon-xs',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				size: 'icon-xs',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				size: 'icon-xs',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_6 = $.child(div_1);

			Button(node_6, {
				size: 'icon-sm',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				size: 'icon-sm',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				size: 'icon-sm',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				size: 'icon-sm',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				size: 'icon-sm',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				size: 'icon-sm',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_12 = $.child(div_2);

			Button(node_12, {
				size: 'icon',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				size: 'icon',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Button(node_14, {
				size: 'icon',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Button(node_15, {
				size: 'icon',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Button(node_16, {
				size: 'icon',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Button(node_17, {
				size: 'icon',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_18 = $.child(div_3);

			Button(node_18, {
				size: 'icon-lg',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Button(node_19, {
				size: 'icon-lg',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Button(node_20, {
				size: 'icon-lg',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				size: 'icon-lg',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			Button(node_22, {
				size: 'icon-lg',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			Button(node_23, {
				size: 'icon-lg',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}