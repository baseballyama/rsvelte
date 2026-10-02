import * as $ from 'svelte/internal/server';
import AdminActions from '$/lib/AdminActions.svelte';
import AdminSearch from '$/lib/AdminSearch.svelte';
import { dev } from '$app/environment';
import { enhance } from '$app/forms';
import FormWithLoader from '$lib/FormWithLoader.svelte';
import { form_action } from '$lib/form_action';
import { format } from 'date-fns';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let shows = $.derived(() => data.shows);
		let confirm = false;
		let search_text = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1 class="h4">Shows</h1> `);

			AdminActions($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<form action="?/import_all_shows" method="POST"><button type="submit">Sync Changed/New Shows</button></form> <form action="?/refresh_all" method="POST"><button class="subtle" type="submit">Sync All Shows</button></form> <form action="/webhooks/refresh" method="GET"><button class="subtle" type="submit">Test Refresh Webhook</button></form> `);

					if (dev) {
						$$renderer.push(`<!--[0--><form action="?/delete_all_shows" method="post" style="position: relative;">`);

						if (!confirm) {
							$$renderer.push(`<!--[0--><button class="warning">Drop All Shows</button>`);
						} else {
							$$renderer.push(`<!--[-1--><p class="small" style="position: absolute; top: -120%; width: auto; white-space: nowrap;">This will delete all shows, guests, transcripts (utterance, word and transcripts)</p> <button type="submit" class="warning">For real, drop um'</button>`);
						}

						$$renderer.push(`<!--]--></form>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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

			$$renderer.push(`<!----> <div class="table-container"><table><thead><tr class="svelte-19oyn9c"><th>Number</th><th>Title</th><th>Type</th><th>Guests</th><th>Transcript</th><th>AI Notes</th></tr></thead><tbody><!--[-->`);

			const each_array = $.ensure_array_like(shows().filter((s) => s.title.toLowerCase().includes(search_text.toLowerCase())));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let show = each_array[$$index];

				$$renderer.push(`<tr class="svelte-19oyn9c"><td><a${$.attr('href', `/admin/shows/${$.stringify(show.number)}`)}>#${$.escape(show.number)}</a></td><td><a${$.attr('href', `/${$.stringify(show.number)}`)} target="_blank">${$.escape(show.title)}
								[↗]</a> <br/> <span class="text-xs">${$.escape(show.date.getTime() > Date.now() ? 'Scheduled' : 'Published')}
								${$.escape(format(show.date, 'EEE MMM d yyyy h:mm:ss a z'))}</span></td><td>`);

				if (format(show.date, 'EEE') === 'Mon') {
					$$renderer.push(`<!--[0-->Hasty`);
				} else if (format(show.date, 'EEE') === 'Wed') {
					$$renderer.push(`<!--[1-->Tasty`);
				} else if (format(show.date, 'EEE') === 'Fri') {
					$$renderer.push(`<!--[2-->Supper Club`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></td><td class="center svelte-19oyn9c">${$.escape(show._count.guests)}</td><td class="center svelte-19oyn9c">`);

				if (show.transcript) {
					$$renderer.push(`<!--[0-->✅ `);

					{
						function children($$renderer, { loading }) {
							$$renderer.push(`<input type="hidden" name="show_number"${$.attr('value', show.number)}/> <button class="warning" type="submit">${$.escape(loading ? 'Deleting' : 'Delete')}</button>`);
						}

						FormWithLoader($$renderer, {
							global: false,
							action: '?/delete_transcript',
							method: 'post',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');

					{
						function children($$renderer, { loading }) {
							$$renderer.push(`<input type="hidden" name="show_number"${$.attr('value', show.number)}/> <button type="submit">Fetch${$.escape(loading ? 'ing' : '')}</button>`);
						}

						FormWithLoader($$renderer, {
							global: false,
							action: '?/fetch_show_transcript',
							method: 'post',
							children,
							$$slots: { default: true }
						});
					}
				}

				$$renderer.push(`<!--]--></td><td class="center svelte-19oyn9c">`);

				{
					function children($$renderer, { loading }) {
						$$renderer.push(`<fieldset${$.attr('disabled', loading, true)} class="svelte-19oyn9c"><input type="hidden" name="show_number"${$.attr('value', show.number)}/> `);

						if (show.aiShowNote) {
							$$renderer.push(`<!--[0-->✅ <button type="submit">Refetch${$.escape(loading ? 'ing' : '')}</button>`);
						} else {
							$$renderer.push(`<!--[-1--><button type="submit">Fetch${$.escape(loading ? 'ing' : '')}</button>`);
						}

						$$renderer.push(`<!--]--></fieldset>`);
					}

					FormWithLoader($$renderer, {
						global: false,
						action: '?/fetch_AI_notes',
						method: 'post',
						children,
						$$slots: { default: true }
					});
				}

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