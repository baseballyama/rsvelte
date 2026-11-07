import * as $ from 'svelte/internal/server';
import BadgeIndicator from "carbon-components-svelte/BadgeIndicator/BadgeIndicator.svelte";
import Button from "carbon-components-svelte/Button/Button.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

export default function Button_test($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->primary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->secondary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'tertiary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->tertiary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'ghost',
		children: ($$renderer) => {
			$$renderer.push(`<!---->ghost`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'danger',
		children: ($$renderer) => {
			$$renderer.push(`<!---->danger`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'danger-tertiary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->danger-tertiary`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'danger-ghost',
		children: ($$renderer) => {
			$$renderer.push(`<!---->danger-ghost`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'field',
		children: ($$renderer) => {
			$$renderer.push(`<!---->field size`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'small',
		children: ($$renderer) => {
			$$renderer.push(`<!---->small size`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		icon: Add,
		tooltipPosition: 'bottom',
		tooltipAlignment: 'center',
		iconDescription: 'Tooltip text'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-icon-only-hide-tooltip',
		icon: Add,
		hideTooltip: true,
		iconDescription: 'Add item'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-icon-portal',
		icon: Add,
		portalTooltip: true,
		tooltipPosition: 'top',
		tooltipAlignment: 'center',
		iconDescription: 'Portal tooltip text'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-icon-no-description',
		icon: Add,
		'aria-label': 'Custom accessible name'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '#',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Link button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: 'https://example.com',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->External link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		as: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { props }) => {
				$$renderer.push(`<p${$.attributes({ ...props })}>Custom element</p>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-disabled-href',
		href: '#',
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled link button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		icon: Add,
		children: ($$renderer) => {
			$$renderer.push(`<!---->With icon`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Test button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Button($$renderer, { skeleton: true });
	$$renderer.push(`<!----> `);
	Button($$renderer, { skeleton: true, size: 'field' });
	$$renderer.push(`<!----> `);
	Button($$renderer, { skeleton: true, size: 'small' });
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-icon-a',
		kind: 'ghost',
		icon: Add,
		iconDescription: 'Add'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-icon-b',
		kind: 'ghost',
		icon: Add,
		iconDescription: 'Delete'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'btn-icon-c',
		kind: 'ghost',
		icon: Add,
		iconDescription: 'Save'
	});

	$$renderer.push(`<!----> <div data-testid="badge-none">`);
	Button($$renderer, { kind: 'ghost', icon: Add, iconDescription: 'Notifications' });
	$$renderer.push(`<!----></div> <div data-testid="badge-dot">`);

	Button($$renderer, {
		kind: 'ghost',
		icon: Add,
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$renderer) => {
				BadgeIndicator($$renderer, { slot: 'badge', count: 0 });
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="badge-count">`);

	Button($$renderer, {
		kind: 'ghost',
		icon: Add,
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$renderer) => {
				BadgeIndicator($$renderer, { slot: 'badge', count: 4 });
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="badge-label">`);

	Button($$renderer, {
		kind: 'ghost',
		icon: Add,
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$renderer) => {
				BadgeIndicator($$renderer, { slot: 'badge', count: '1.2K' });
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="badge-size-override">`);

	Button($$renderer, {
		kind: 'ghost',
		size: 'small',
		icon: Add,
		iconDescription: 'Notifications',
		$$slots: {
			badge: ($$renderer) => {
				BadgeIndicator($$renderer, { slot: 'badge', count: 4 });
			}
		}
	});

	$$renderer.push(`<!----></div>`);
}