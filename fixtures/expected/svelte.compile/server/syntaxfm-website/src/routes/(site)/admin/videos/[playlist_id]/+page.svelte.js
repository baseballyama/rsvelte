import * as $ from 'svelte/internal/server';
import AdminSearch from '$/lib/AdminSearch.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const { playlist, videos } = data;
		let search_text = '';
		let filtered = $.derived(() => videos?.filter((s) => s.title.toLowerCase().includes(search_text.toLowerCase())));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>${$.escape(playlist?.title)}</h1> <div>`);

			AdminSearch($$renderer, {
				get text() {
					return search_text;
				},

				set text($$value) {
					search_text = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="table-container"><table><thead><tr><th>Title</th><th>Videos</th><th>Published At</th><th>Id</th><th>Action</th></tr></thead><tbody>`);

			if (filtered()) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(filtered());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let playlist = each_array[$$index];

					$$renderer.push(`<tr><td>${$.escape(playlist.title)}</td></tr>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></tbody></table></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}