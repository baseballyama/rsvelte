import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;

		$$renderer.push(`<h1>${$.escape(form?.message ?? data.message)}</h1> <form method="POST"><input name="message"/> <button>submit</button></form>`);
	});
}