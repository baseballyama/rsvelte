import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BadgeIndicator from "carbon-components-svelte/BadgeIndicator/BadgeIndicator.svelte";
import Button from "carbon-components-svelte/Button/Button.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

var root = $.from_html(`<p>Custom element</p>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <div data-testid="badge-none"><!></div> <div data-testid="badge-dot"><!></div> <div data-testid="badge-count"><!></div> <div data-testid="badge-label"><!></div> <div data-testid="badge-size-override"><!></div>`, 1);

export default function Button_test($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('primary');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		kind: 'secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('secondary');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		kind: 'tertiary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('tertiary');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		kind: 'ghost',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('ghost');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		kind: 'danger',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('danger');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		kind: 'danger-tertiary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('danger-tertiary');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		kind: 'danger-ghost',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('danger-ghost');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		size: 'field',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('field size');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Button(node_8, {
		size: 'small',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('small size');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Button(node_9, {
		get icon() {
			return Add;
		},
		tooltipPosition: 'bottom',
		tooltipAlignment: 'center',
		iconDescription: 'Tooltip text'
	});

	var node_10 = $.sibling(node_9, 2);

	Button(node_10, {
		'data-testid': 'btn-icon-only-hide-tooltip',
		get icon() {
			return Add;
		},
		hideTooltip: true,
		iconDescription: 'Add item'
	});

	var node_11 = $.sibling(node_10, 2);

	Button(node_11, {
		'data-testid': 'btn-icon-portal',
		get icon() {
			return Add;
		},
		portalTooltip: true,
		tooltipPosition: 'top',
		tooltipAlignment: 'center',
		iconDescription: 'Portal tooltip text'
	});

	var node_12 = $.sibling(node_11, 2);

	Button(node_12, {
		'data-testid': 'btn-icon-no-description',
		get icon() {
			return Add;
		},
		'aria-label': 'Custom accessible name'
	});

	var node_13 = $.sibling(node_12, 2);

	Button(node_13, {
		href: '#',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Link button');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Button(node_14, {
		href: 'https://example.com',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('External link');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Button(node_15, {
		as: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const props = $.derived(() => $$slotProps.props);
				var p = root();

				$.attribute_effect(p, () => ({ ...$.get(props) }));
				$.append($$anchor, p);
			}
		}
	});

	var node_16 = $.sibling(node_15, 2);

	Button(node_16, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Disabled button');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Button(node_17, {
		'data-testid': 'btn-disabled-href',
		href: '#',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Disabled link button');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Button(node_18, {
		get icon() {
			return Add;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('With icon');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Button(node_19, {
		'data-testid': 'btn',
		$$events: {
			click: () => {
				console.log("click");
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Test button');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_19, 2);

	Button(node_20, { skeleton: true });

	var node_21 = $.sibling(node_20, 2);

	Button(node_21, { skeleton: true, size: 'field' });

	var node_22 = $.sibling(node_21, 2);

	Button(node_22, { skeleton: true, size: 'small' });

	var node_23 = $.sibling(node_22, 2);

	Button(node_23, {
		'data-testid': 'btn-icon-a',
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Add'
	});

	var node_24 = $.sibling(node_23, 2);

	Button(node_24, {
		'data-testid': 'btn-icon-b',
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Delete'
	});

	var node_25 = $.sibling(node_24, 2);

	Button(node_25, {
		'data-testid': 'btn-icon-c',
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Save'
	});

	var div = $.sibling(node_25, 2);
	var node_26 = $.child(div);

	Button(node_26, {
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Notifications'
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_27 = $.child(div_1);

	Button(node_27, {
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$anchor, $$slotProps) => {
				BadgeIndicator($$anchor, { slot: 'badge', count: 0 });
			}
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_28 = $.child(div_2);

	Button(node_28, {
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$anchor, $$slotProps) => {
				BadgeIndicator($$anchor, { slot: 'badge', count: 4 });
			}
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_29 = $.child(div_3);

	Button(node_29, {
		kind: 'ghost',
		get icon() {
			return Add;
		},
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$anchor, $$slotProps) => {
				BadgeIndicator($$anchor, { slot: 'badge', count: '1.2K' });
			}
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_30 = $.child(div_4);

	Button(node_30, {
		kind: 'ghost',
		size: 'small',
		get icon() {
			return Add;
		},
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$anchor, $$slotProps) => {
				BadgeIndicator($$anchor, { slot: 'badge', count: 4 });
			}
		}
	});

	$.reset(div_4);
	$.append($$anchor, fragment);
}