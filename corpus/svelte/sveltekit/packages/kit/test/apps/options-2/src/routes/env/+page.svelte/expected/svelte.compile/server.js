import * as $ from 'svelte/internal/server';
import { browser } from '$app/env';
import { MESSAGE } from '$app/env/public';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./$types').PageProps} */
		let { data } = $$props;

		$$renderer.push(`<p data-testid="public">public: ${$.escape(MESSAGE)}</p> <p data-testid="browser">browser: ${$.escape(browser)}</p> <p data-testid="private-dynamic">private dynamic: ${$.escape(data.private_dynamic)}</p> <p data-testid="private-static">private static: ${$.escape(data.private_static)}</p> <p data-testid="private-validated-default">private validated default: ${$.escape(data.private_validated_default)}</p>`);
	});
}