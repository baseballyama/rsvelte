import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let checked = false;

		$$renderer.push(`<input type="checkbox"${$.attr('checked', checked, true)}/> <button>${$.escape(
			// this should not show up in the logs
			count
		)}</button>`);
	});
}