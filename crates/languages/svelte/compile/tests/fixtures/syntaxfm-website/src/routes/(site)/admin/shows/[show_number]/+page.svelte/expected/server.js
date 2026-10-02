import * as $ from 'svelte/internal/server';
import Dump from './Dump.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let formRef = null;
		let show = $.derived(() => data.show);

		$$renderer.push(`<h1 class="h4">DB dump</h1> <p>This is the data that is currently in the DB. No caches.</p> `);

		if (show()) {
			$$renderer.push('<!--[0-->');
			Dump($$renderer, { data: show() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="spotify-sync svelte-jf39l4"><h2 class="h5 svelte-jf39l4">Spotify Sync</h2> <p class="svelte-jf39l4">Sync Spotify data for this episode</p> `);

		if (form?.message) {
			$$renderer.push(`<!--[0--><div${$.attr_class('sync-message svelte-jf39l4', void 0, { 'error': !form?.success, 'success': form?.success })}>${$.escape(form.message)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <form method="POST" action="?/sync_spotify" class="svelte-jf39l4"><button type="submit">Sync Spotify</button></form></div> <h1 class="h4">AI Show Notes</h1> `);

		if (show()?.aiShowNote) {
			$$renderer.push(`<!--[0--><form class="flex flex-col svelte-jf39l4" method="POST" action="?/update_ai_show_note">`);

			if (form?.message) {
				$$renderer.push(`<!--[0--><div class="errors svelte-jf39l4">${$.escape(form?.message)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <label for="title">Title</label> <input name="title" id="title"${$.attr('value', show()?.aiShowNote.title)}/> <label for="description">Description</label> <textarea name="description" id="description"${$.attr('rows', 4)}>`);

			const $$body = $.escape(show()?.aiShowNote.description);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea> <button>Update</button></form> `);
			Dump($$renderer, { data: show()?.aiShowNote });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><p>Notes not available</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}