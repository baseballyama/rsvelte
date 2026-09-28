import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap items-center gap-2"><!> <!> <!> <!> <!> <!></div>`, 1);

export default function Button_invalid_states($$anchor) {
	Example($$anchor, {
		title: 'Invalid States',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Button(node, {
				size: 'xs',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				size: 'xs',
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Secondary');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				size: 'xs',
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Outline');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				size: 'xs',
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Ghost');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				size: 'xs',
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Destructive');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				size: 'xs',
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Link');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_6 = $.child(div_1);

			Button(node_6, {
				size: 'sm',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Default');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				size: 'sm',
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Secondary');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				size: 'sm',
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Outline');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				size: 'sm',
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Ghost');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				size: 'sm',
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Destructive');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				size: 'sm',
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Link');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_12 = $.child(div_2);

			Button(node_12, {
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Default');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Secondary');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Button(node_14, {
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Outline');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Button(node_15, {
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Ghost');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Button(node_16, {
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Destructive');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Button(node_17, {
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Link');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_18 = $.child(div_3);

			Button(node_18, {
				size: 'lg',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Default');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Button(node_19, {
				size: 'lg',
				variant: 'secondary',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Secondary');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Button(node_20, {
				size: 'lg',
				variant: 'outline',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Outline');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				size: 'lg',
				variant: 'ghost',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Ghost');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			Button(node_22, {
				size: 'lg',
				variant: 'destructive',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Destructive');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			Button(node_23, {
				size: 'lg',
				variant: 'link',
				'aria-invalid': 'true',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Link');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}