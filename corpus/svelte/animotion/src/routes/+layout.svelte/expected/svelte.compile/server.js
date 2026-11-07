import * as $ from 'svelte/internal/server';
import '../styles/app.css';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('12qhfyh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Animotion</title>`);
		});
	});

	children($$renderer);
	$$renderer.push(`<!---->`);
}