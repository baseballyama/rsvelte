import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {string} */
		let status;

		function del() {
			fetch('delete-route/42.json', { method: 'DELETE' }).then((r) => r.json()).then(({ id }) => status = `deleted ${id}`, (e) => status = e.toString());
		}

		$$renderer.push(`<button class="del">delete</button> `);

		if (status) {
			$$renderer.push(`<!--[0--><h1>${$.escape(status)}</h1>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}