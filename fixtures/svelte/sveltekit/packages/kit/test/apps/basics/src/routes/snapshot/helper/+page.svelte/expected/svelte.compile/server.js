import * as $ from 'svelte/internal/server';
import { afterNavigate, goto, snapshot } from '$app/navigation';
import { Foo } from '#lib';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = '';
		let manual = '';
		let foo = new Foo('initial');

		/** @type {string[]} */
		let order = [];

		snapshot({
			capture: () => message,
			restore: (value) => {
				message = value;
				order.push('restore');
			}
		});

		snapshot({
			id: 'snapshot-helper-manual',
			capture: () => manual,
			restore: (value) => manual = value
		});

		snapshot({
			id: 'snapshot-helper-transport',
			capture: () => foo,
			restore: (value) => foo = value
		});

		afterNavigate(() => {
			order.push('afterNavigate');
		});

		$$renderer.push(`<label>default <input data-testid="default"${$.attr('value', message)}/></label> <label>manual <input data-testid="manual"${$.attr('value', manual)}/></label> <button>shallow</button> <button>change transport value</button> <a href="/snapshot/helper/b">b</a> <p data-testid="transport">${$.escape(foo.bar())}</p> <p data-testid="order">${$.escape(order.join(','))}</p>`);
	});
}