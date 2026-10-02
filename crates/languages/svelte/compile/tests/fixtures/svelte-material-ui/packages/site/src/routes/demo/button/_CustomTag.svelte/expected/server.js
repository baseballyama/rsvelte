import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';

export default function _CustomTag($$renderer) {
	let clicked = 0;

	function handleClick(event) {
		if (event.key === 'Enter') {
			clicked++;
		}
	}

	$$renderer.push(`<div>`);

	Button($$renderer, {
		tag: 'em',
		onclick: () => clicked++,
		onkeypress: handleClick,
		tabindex: 0,
		role: 'button',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Em Tag`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <ul class="svelte-ub75b1">`);

	Button($$renderer, {
		tag: 'li',
		onclick: () => clicked++,
		onkeypress: handleClick,
		tabindex: 0,
		role: 'button',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Li Tag`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		tag: 'li',
		onclick: () => clicked++,
		onkeypress: handleClick,
		tabindex: 0,
		role: 'button',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Li Tag`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></ul></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}