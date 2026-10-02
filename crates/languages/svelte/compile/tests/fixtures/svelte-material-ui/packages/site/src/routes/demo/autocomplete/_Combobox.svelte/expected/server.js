import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';
import Button, { Label } from '@smui/button';

export default function _Combobox($$renderer) {
	let fruits = [
		'Apple',
		'Orange',
		'Banana',
		'Mango',
		'Lemon',
		'Cherry',
		'Blueberry',
		'Grape',
		'Strawberry'
	];

	let value = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		Autocomplete($$renderer, {
			combobox: true,
			options: fruits,
			label: 'Fruit',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(value || '')}</pre> <div style="margin-top: 1em;"><div>Programmatically select:</div> `);

		Button($$renderer, {
			onclick: () => value = 'Dragonfruit',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dragonfruit`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => value = 'Elderberry',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Elderberry`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}