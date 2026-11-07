import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;

		$$renderer.push(`<p id="result">${$.escape(form?.result ?? '')}</p> <form method="POST"><input type="hidden" name="input" value="hello"/> <button>submit</button></form>`);
	});
}