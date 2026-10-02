import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
		let { data, form } = $$props;

		$$renderer.push(`<h1>${$.escape(data.get_message)} / ${$.escape(form?.errors?.post_message)}</h1> <h2>status: ${$.escape(page.status)}</h2>`);
	});
}