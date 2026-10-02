import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		const $$d = $.derived(() => {
				let value = 0;

				return {
					get value() {
						return value;
					}
				};
			}),
			value = $.derived(() => $$d().value);

		$$renderer.push(`<button>clicks: ${$.escape(value())}</button>`);
	});
}