import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const q = $.derived(() => page.url.searchParams.get('q') || undefined);

		$$renderer.push(`<button type="button">test</button> <p>${$.escape(
			// @ts-expect-error set is not in the types; we wanna test here that we guard against mutation in goto, too
			// @ts-expect-error
			`${q()}`
		)}</p>`);
	});
}