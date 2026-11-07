import * as $ from 'svelte/internal/server';
import Fab, { Label, Icon } from '@smui/fab';

export default function _Link($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div class="flexy"><div class="margins">`);

	Fab($$renderer, {
		onclick: () => clicked++,
		href: 'http://example.com',
		target: '_blank',
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		color: 'primary',
		onclick: () => clicked++,
		href: 'http://example.com',
		target: '_blank',
		children: ($$renderer) => {
			Icon($$renderer, {
				class: 'material-icons',
				children: ($$renderer) => {
					$$renderer.push(`<!---->favorite`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		onclick: () => clicked++,
		href: 'http://example.com',
		target: '_blank',
		extended: true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="margins">`);

	Fab($$renderer, {
		color: 'primary',
		onclick: () => clicked++,
		href: 'http://example.com',
		target: '_blank',
		extended: true,
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}