import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Default <!>`, 1);
var root_1 = $.from_html(`Secondary <!>`, 1);
var root_2 = $.from_html(`Outline <!>`, 1);
var root_3 = $.from_html(`Ghost <!>`, 1);
var root_4 = $.from_html(`Destructive <!>`, 1);
var root_5 = $.from_html(`Link <!>`, 1);
var root_6 = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div>`, 1);

export default function Button_icon_right($$anchor) {
	Example($$anchor, {
		title: 'Icon Right',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Button(node, {
				size: 'xs',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_1 = $.sibling($.first_child(fragment_2));

					IconPlaceholder(node_1, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Button(node_2, {
				size: 'xs',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root_1();
					var node_3 = $.sibling($.first_child(fragment_3));

					IconPlaceholder(node_3, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Button(node_4, {
				size: 'xs',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_2();
					var node_5 = $.sibling($.first_child(fragment_4));

					IconPlaceholder(node_5, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Button(node_6, {
				size: 'xs',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_5 = root_3();
					var node_7 = $.sibling($.first_child(fragment_5));

					IconPlaceholder(node_7, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			Button(node_8, {
				size: 'xs',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_6 = root_4();
					var node_9 = $.sibling($.first_child(fragment_6));

					IconPlaceholder(node_9, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_8, 2);

			Button(node_10, {
				size: 'xs',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_7 = root_5();
					var node_11 = $.sibling($.first_child(fragment_7));

					IconPlaceholder(node_11, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_12 = $.child(div_1);

			Button(node_12, {
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_8 = root();
					var node_13 = $.sibling($.first_child(fragment_8));

					IconPlaceholder(node_13, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_12, 2);

			Button(node_14, {
				size: 'sm',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_9 = root_1();
					var node_15 = $.sibling($.first_child(fragment_9));

					IconPlaceholder(node_15, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_14, 2);

			Button(node_16, {
				size: 'sm',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_10 = root_2();
					var node_17 = $.sibling($.first_child(fragment_10));

					IconPlaceholder(node_17, {
						'data-icon': 'inline-end',
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine'
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_16, 2);

			Button(node_18, {
				size: 'sm',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_11 = root_3();
					var node_19 = $.sibling($.first_child(fragment_11));

					IconPlaceholder(node_19, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_18, 2);

			Button(node_20, {
				size: 'sm',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_12 = root_4();
					var node_21 = $.sibling($.first_child(fragment_12));

					IconPlaceholder(node_21, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_20, 2);

			Button(node_22, {
				size: 'sm',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_13 = root_5();
					var node_23 = $.sibling($.first_child(fragment_13));

					IconPlaceholder(node_23, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_24 = $.child(div_2);

			Button(node_24, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_14 = root();
					var node_25 = $.sibling($.first_child(fragment_14));

					IconPlaceholder(node_25, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_24, 2);

			Button(node_26, {
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_15 = root_1();
					var node_27 = $.sibling($.first_child(fragment_15));

					IconPlaceholder(node_27, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_15);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_26, 2);

			Button(node_28, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_16 = root_2();
					var node_29 = $.sibling($.first_child(fragment_16));

					IconPlaceholder(node_29, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_28, 2);

			Button(node_30, {
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_17 = root_3();
					var node_31 = $.sibling($.first_child(fragment_17));

					IconPlaceholder(node_31, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_17);
				},
				$$slots: { default: true }
			});

			var node_32 = $.sibling(node_30, 2);

			Button(node_32, {
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_18 = root_4();
					var node_33 = $.sibling($.first_child(fragment_18));

					IconPlaceholder(node_33, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_32, 2);

			Button(node_34, {
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_19 = root_5();
					var node_35 = $.sibling($.first_child(fragment_19));

					IconPlaceholder(node_35, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_19);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_36 = $.child(div_3);

			Button(node_36, {
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_20 = root();
					var node_37 = $.sibling($.first_child(fragment_20));

					IconPlaceholder(node_37, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});

			var node_38 = $.sibling(node_36, 2);

			Button(node_38, {
				size: 'lg',
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_21 = root_1();
					var node_39 = $.sibling($.first_child(fragment_21));

					IconPlaceholder(node_39, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_38, 2);

			Button(node_40, {
				size: 'lg',
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_22 = root_2();
					var node_41 = $.sibling($.first_child(fragment_22));

					IconPlaceholder(node_41, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_22);
				},
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_40, 2);

			Button(node_42, {
				size: 'lg',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_23 = root_3();
					var node_43 = $.sibling($.first_child(fragment_23));

					IconPlaceholder(node_43, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_23);
				},
				$$slots: { default: true }
			});

			var node_44 = $.sibling(node_42, 2);

			Button(node_44, {
				size: 'lg',
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_24 = root_4();
					var node_45 = $.sibling($.first_child(fragment_24));

					IconPlaceholder(node_45, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_24);
				},
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_44, 2);

			Button(node_46, {
				size: 'lg',
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_25 = root_5();
					var node_47 = $.sibling($.first_child(fragment_25));

					IconPlaceholder(node_47, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_25);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}