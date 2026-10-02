import * as $ from 'svelte/internal/server';

export default function Env03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (import.meta.env.SSR) {
			console.log(location.href); // NG
		} else {
			console.log(location.href);
		}
	});
}