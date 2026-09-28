import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		/** @type {Record<string, { title: string }>} */
		const modal_contents = {
			'please-dont-show-me': { title: 'Oopsie' },
			'please-dont-show-me-jr': { title: 'Oopsie Jr.' }
		};

		/** @type {{ title: string } | undefined} */
		let modal = undefined;

		const show_modal = () => {
			const hash = page.url.hash.substring(1);

			modal = modal_contents[hash];
		};

		onMount(show_modal);
		$$renderer.push(`<h1>${$.escape(modal?.title ?? '')}</h1> <p>Loaded ${$.escape(data.calls)} times.</p>`);
	});
}