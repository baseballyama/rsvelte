import * as $ from 'svelte/internal/server';
import AdminActions from '$/lib/AdminActions.svelte';
import AdminSearch from '$/lib/AdminSearch.svelte';
import FormButton from '$/lib/FormButton.svelte';
import { format } from 'date-fns';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		let playlists = $.derived(() => data.playlists),
			local_playlists = $.derived(() => data.local_playlists);

		let search_text = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1 class="h4">Youtube Playlists</h1> `);

			AdminActions($$renderer, {
				children: ($$renderer) => {
					FormButton($$renderer, {
						text: 'Sync Playlists',
						thinking_text: 'Syncing...',
						action_path: '?/import'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="small">Playlists listed here are what exists on Youtube, if you need to import or update a specific
	playlist select import/update</p> <div>`);

			AdminSearch($$renderer, {
				get text() {
					return search_text;
				},

				set text($$value) {
					search_text = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="table-container"><table><thead><tr><th>Title</th><th>Videos</th><th>Published At</th><th>Id</th><th>Action</th></tr></thead><tbody><!--[-->`);

			const each_array = $.ensure_array_like(playlists().filter((s) => s.title.toLowerCase().includes(search_text.toLowerCase())));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let playlist = each_array[$$index];

				$$renderer.push(`<tr><td>${$.escape(playlist.title)}</td><td>${$.escape(playlist.videos_count)}</td><td>${$.escape(format(playlist.created_at, 'MMM d, yyyy'))}</td><td class="center">${$.escape(playlist.playlist_id)}</td><td class="center">`);

				FormButton($$renderer, {
					text: local_playlists().includes(playlist.playlist_id) ? '🔄 Syncing' : 'Link To Local',
					thinking_text: 'Linking...',
					action_path: '?/import_playlist',
					children: ($$renderer) => {
						$$renderer.push(`<input type="hidden" name="playlist_id"${$.attr('value', playlist.playlist_id)}/>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></td></tr>`);
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