import * as $ from 'svelte/internal/server';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { status, error } = $$props;

		$.head('spq4ih', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(status)}</title>`);
			});
		});

		$$renderer.push(`<h1 class="svelte-spq4ih">hiase</h1> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="error svelte-spq4ih"><h1 class="svelte-spq4ih">${$.escape(status)}</h1> <p class="svelte-spq4ih">${$.escape(error.message)}</p> `);

			if (error.stack) {
				$$renderer.push(`<!--[0--><pre>${$.escape(error.stack)}</pre>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}