import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { m = 1 } = $$props;

		$$renderer.push(`<p>${$.escape((Math.random() * m).toFixed(10))}</p> <p>${$.escape((Math.random() * m).toFixed(10))}</p>`);
	});
}