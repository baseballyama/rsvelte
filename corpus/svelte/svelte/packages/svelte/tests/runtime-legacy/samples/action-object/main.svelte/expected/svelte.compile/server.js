import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const obj = {
			foo: 'bar',
			action(element, { leet }) {
				element.foo = this.foo + leet;
			}
		};

		$$renderer.push(`<button>action</button>`);
	});
}