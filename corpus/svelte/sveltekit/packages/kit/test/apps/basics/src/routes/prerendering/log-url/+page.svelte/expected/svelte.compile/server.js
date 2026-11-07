import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer) {
	let error = false;

	try {
		console.log(page);
	} catch(e) {
		error = true;
	}

	$$renderer.push(`<p>error: ${$.escape(error)}</p>`);
}