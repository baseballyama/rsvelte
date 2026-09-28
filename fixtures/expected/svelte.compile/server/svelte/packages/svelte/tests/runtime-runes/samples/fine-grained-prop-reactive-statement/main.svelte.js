import * as $ from 'svelte/internal/server';
import Old from './old.svelte';

export default function Main($$renderer) {
	let prop = { count: 0 };

	$$renderer.push(`<button>reassign</button> <button>mutate</button> `);
	Old($$renderer, { prop });
	$$renderer.push(`<!---->`);
}