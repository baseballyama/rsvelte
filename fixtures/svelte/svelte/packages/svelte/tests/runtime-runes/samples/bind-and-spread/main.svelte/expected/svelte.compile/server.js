import * as $ from 'svelte/internal/server';
import Button from './button.svelte';

export default function Main($$renderer) {
	let value = 0;
	const props = { class: 'foo' };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, $.spread_props([
			props,
			{
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			}
		]));

		$$renderer.push(`<!----> <button${$.attributes({ ...props })}>${$.escape(value)}</button>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}