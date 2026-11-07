import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let bar = '';

		const foo = {
			set bar(v) {
				console.log(false);
				bar = v;
			},

			get bar() {
				return bar;
			}
		};

		let input;

		$$renderer.push(`<input type="text"${$.attr('value', foo.bar)}/>`);
	});
}