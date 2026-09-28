import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { form } = $$props;

		$$renderer.push(`<form method="POST"><button type="submit">submit</button></form> `);

		if (form) {
			$$renderer.push(`<!--[0--><h1>${$.escape(form?.foo?.bar())}</h1>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <a href="/serialization-basic">To basic form</a>`);
	});
}