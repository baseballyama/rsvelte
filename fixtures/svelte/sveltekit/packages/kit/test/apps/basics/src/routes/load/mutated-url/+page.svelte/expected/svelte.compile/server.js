import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData }} */
		let { data } = $$props;

		function update_q() {
			// @ts-expect-error set is not in the types; we wanna test here that we guard against mutation in goto, too
			page.url.searchParams.set('q', 'updated');

			// @ts-expect-error
			goto(page.url);
		}

		$$renderer.push(`<h1>${$.escape(data.q)}</h1> <button>update q</button>`);
	});
}