import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { message, count } = $$props;

		$$renderer.push(`<p>${$.escape(count)}</p> <button disabled="">update</button>`);
	});
}