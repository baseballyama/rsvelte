import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let srcObject = void 0;

		$$renderer.push(`<video${$.attr('srcobject', srcObject)}></video>`);
	});
}