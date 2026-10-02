import * as $ from 'svelte/internal/server';
import AdminActions from '$/lib/AdminActions.svelte';
import AdminSearch from '$/lib/AdminSearch.svelte';
import { format } from 'date-fns';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let local_playlists = $.derived(() => data.local_playlists);
		let search_text = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1 class="h4">🔄 Synced Playlists</h1> `);

			AdminActions($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<a href="/admin/videos/import">Import New Videos</a>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>`);

			AdminSearch($$renderer, {
				get text() {
					return search_text;
				},

				set text($$value) {
					search_text = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="table-container"><table><thead><tr><th>Title</th><th>Videos</th><th>Published At</th><th>Id</th></tr></thead><tbody><!--[-->`);

			const each_array = $.ensure_array_like(local_playlists().filter((s) => s.title.toLowerCase().includes(search_text.toLowerCase())));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let playlist = each_array[$$index];

				$$renderer.push(`<tr><td><a${$.attr('href', `/admin/videos/${$.stringify(playlist.id)}`)}>${$.escape(playlist.title)}</a></td><td>${$.escape(playlist.item_count)}</td><td>${$.escape(format(playlist.created_at, 'MMM d, yyyy'))}</td><td>${$.escape(playlist.id)}</td></tr>`);
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