import * as $ from 'svelte/internal/server';
import Seo from './Seo.svelte';

export default function Main($$renderer) {
	let post = null;

	function toggle() {
		post = post ? null : { title: 'hello world' };
	}

	$$renderer.push(`<button>toggle</button> `);

	if (post) {
		$$renderer.push('<!--[0-->');
		Seo($$renderer, { post });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}