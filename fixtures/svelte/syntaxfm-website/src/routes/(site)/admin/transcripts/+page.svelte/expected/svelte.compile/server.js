import * as $ from 'svelte/internal/server';
import AdminActions from '$/lib/AdminActions.svelte';
import { enhance } from '$app/forms';
import { form_action } from '$lib/form_action';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let transcripts = $.derived(() => data.transcripts);

		$$renderer.push(`<h1 class="h4">Transcripts</h1> `);

		AdminActions($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<form action="?/import_transcripts" method="post"><button type="submit">Import All Transcripts</button></form> <form action="?/delete_all_transcripts" method="post"><button class="warning" type="submit">Drop All transcripts</button></form> <form action="/webhooks/refresh" method="post"><button class="subtle" type="submit">Test Post</button></form>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="table-container"><table><thead><tr><th>Number</th><th>Name</th><th>Utterance Count</th></tr></thead><tbody>`);

		if (!transcripts()) {
			$$renderer.push(`<!--[0--><tr><td colspan="4">No Transcripts found</td></tr>`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(transcripts());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let transcript = each_array[$$index];

				$$renderer.push(`<tr><td>${$.escape(transcript.show_number)}</td><td>${$.escape(transcript.show.title)}</td><td>${$.escape(transcript._count.utterances)}</td></tr>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></tbody></table></div>`);
	});
}