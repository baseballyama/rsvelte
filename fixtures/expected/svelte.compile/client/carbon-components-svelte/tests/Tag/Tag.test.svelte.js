import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tag from "carbon-components-svelte/Tag/Tag.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tag_test($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	Tag(node, {
		class: 'my-class',
		style: 'margin: 1rem;',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('IBM Cloud');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tag(node_1, {
		type: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('red');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Tag(node_2, {
		type: 'magenta',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('magenta');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tag(node_3, {
		type: 'purple',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('purple');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Tag(node_4, {
		type: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('blue');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Tag(node_5, {
		type: 'cyan',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('cyan');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Tag(node_6, {
		type: 'teal',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('teal');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Tag(node_7, {
		type: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('green');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Tag(node_8, {
		type: 'gray',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('gray');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Tag(node_9, {
		type: 'cool-gray',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('cool-gray');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Tag(node_10, {
		type: 'warm-gray',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('warm-gray');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Tag(node_11, {
		type: 'high-contrast',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('high-contrast');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Tag(node_12, {
		type: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('outline');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Tag(node_13, {
		filter: true,
		$$events: {
			click: () => {
				console.log("click");
			},

			close: () => {
				console.log("close");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Filterable');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Tag(node_14, {
		get icon() {
			return Add;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Custom icon');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Tag(node_15, {
		interactive: true,
		$$events: {
			click: () => {
				console.log("click");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('Text');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	Tag(node_16, { skeleton: true });

	var node_17 = $.sibling(node_16, 2);

	Tag(node_17, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_16 = $.text('Small tag');

			$.append($$anchor, text_16);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Tag(node_18, {
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_17 = $.text('Large tag');

			$.append($$anchor, text_17);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Tag(node_19, {
		size: 'lg',
		filter: true,
		$$events: {
			close: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_18 = $.text('Large filterable');

			$.append($$anchor, text_18);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_19, 2);

	Tag(node_20, { size: 'lg', skeleton: true });

	var node_21 = $.sibling(node_20, 2);

	Tag(node_21, {
		filter: true,
		disabled: true,
		title: 'Custom title',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_19 = $.text('Disabled filterable');

			$.append($$anchor, text_19);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_21, 2);

	Tag(node_22, {
		interactive: true,
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_20 = $.text('Disabled interactive');

			$.append($$anchor, text_20);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_22, 2);

	Tag(node_23, {
		inline: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_21 = $.text('Inline tag');

			$.append($$anchor, text_21);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_23, 2);

	Tag(node_24, {
		id: 'custom-tag-id',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_22 = $.text('Custom ID tag');

			$.append($$anchor, text_22);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_24, 2);

	Tag(node_25, {
		$$events: {
			mouseover: () => {
				console.log("mouseover");
			},

			mouseenter: () => {
				console.log("mouseenter");
			},

			mouseleave: () => {
				console.log("mouseleave");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_23 = $.text('Mouse events');

			$.append($$anchor, text_23);
		},
		$$slots: { default: true }
	});

	var node_26 = $.sibling(node_25, 2);

	Tag(node_26, {
		interactive: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_24 = $.text('Icon slot');

			$.append($$anchor, text_24);
		},

		$$slots: {
			default: true,
			icon: ($$anchor, $$slotProps) => {
				Add($$anchor, { slot: 'icon' });
			}
		}
	});

	var node_27 = $.sibling(node_26, 2);

	Tag(node_27, {
		filter: true,
		$$events: {
			click: () => {
				console.log("filter-body-click");
			},

			close: () => {
				console.log("filter-close");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_25 = $.text('Filter click and close');

			$.append($$anchor, text_25);
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_27, 2);

	Tag(node_28, {
		href: '/filtered?tag=ml',
		type: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_26 = $.text('Linked tag');

			$.append($$anchor, text_26);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_28, 2);

	Tag(node_29, {
		href: '/filtered?tag=ml',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_27 = $.text('External linked tag');

			$.append($$anchor, text_27);
		},
		$$slots: { default: true }
	});

	var node_30 = $.sibling(node_29, 2);

	Tag(node_30, {
		href: '/filtered?tag=ml',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_28 = $.text('Disabled linked tag');

			$.append($$anchor, text_28);
		},
		$$slots: { default: true }
	});

	var node_31 = $.sibling(node_30, 2);

	Tag(node_31, {
		filter: true,
		href: '/should-not-link',
		$$events: {
			close: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_29 = $.text('Filter wins over href');

			$.append($$anchor, text_29);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}