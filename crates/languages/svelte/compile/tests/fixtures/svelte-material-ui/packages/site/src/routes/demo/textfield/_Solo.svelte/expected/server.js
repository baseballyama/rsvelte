import * as $ from 'svelte/internal/server';
import { Input } from '@smui/textfield';
import Paper from '@smui/paper';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';

export default function _Solo($$renderer) {
	let value = '';

	function doSearch() {
		alert('Search for ' + value);
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			doSearch();
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="solo-demo-container solo-container svelte-gwyy1o">`);

		Paper($$renderer, {
			class: 'solo-paper',
			elevation: 6,
			children: ($$renderer) => {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->search`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					onkeydown: handleKeyDown,
					placeholder: 'Search',
					class: 'solo-input',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Fab($$renderer, {
			onclick: doSearch,
			disabled: value === '',
			color: 'primary',
			mini: true,
			class: 'solo-fab',
			children: ($$renderer) => {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->arrow_forward`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status svelte-gwyy1o">Value: ${$.escape(value)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}