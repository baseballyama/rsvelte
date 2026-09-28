import * as $ from 'svelte/internal/server';
import { store, themeState } from './theme.svelte.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let i = 0;

		const increment = () => {
			store.update(() => ({ theme: ++i % 2 == 0 ? 'dark' : 'light' }));
		};

		$$renderer.push(`<button>+</button> ${$.escape(themeState.value.theme)}`);
	});
}