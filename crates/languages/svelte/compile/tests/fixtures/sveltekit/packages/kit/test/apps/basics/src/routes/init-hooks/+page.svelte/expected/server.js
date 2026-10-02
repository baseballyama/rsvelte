import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;

		$$renderer.push(`<p>${$.escape(data.did_init_run)}</p> <a href="/init-hooks/navigate">navigate</a>`);
	});
}