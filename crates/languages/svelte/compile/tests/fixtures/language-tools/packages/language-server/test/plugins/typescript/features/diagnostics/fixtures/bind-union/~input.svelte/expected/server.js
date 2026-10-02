import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Input($$renderer) {
	let checked = false;
	let value = 'foo';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<input type="checkbox"${$.attr('checked', checked, true)}/> `);

		if (checked === true) {
			$$renderer.push(`<!--[0-->checked`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (value === 'bar') {
			$$renderer.push(`<!--[0-->bar`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Component($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}