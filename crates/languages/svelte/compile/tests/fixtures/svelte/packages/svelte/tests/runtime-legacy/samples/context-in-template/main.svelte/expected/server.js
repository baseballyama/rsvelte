import * as $ from 'svelte/internal/server';
import { getContext, setContext } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext('val', 'hello world');

		const get_val = () => {
			return getContext('val');
		};

		$$renderer.push(`<!---->${$.escape(get_val())}`);
	});
}