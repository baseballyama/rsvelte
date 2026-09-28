import * as $ from 'svelte/internal/server';
import { preloadData } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {any} */
		let data;

		$$renderer.push(`<button type="button">404</button> <button type="button">500</button> <p>${$.escape(`${data?.type}`)} ${$.escape(`${data?.status}`)} ${$.escape(`${data?.error?.message}`)}</p>`);
	});
}