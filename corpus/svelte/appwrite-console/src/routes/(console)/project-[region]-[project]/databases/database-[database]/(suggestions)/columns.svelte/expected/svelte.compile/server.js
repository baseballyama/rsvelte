import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';
import Input from './input.svelte';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { entityColumnSuggestions } from './store';

export default function Columns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false } = $$props;
		const isOnRowsPage = $.derived(() => page.route?.id?.endsWith('table-[table]'));

		function resetSuggestionsStore() {
			show = false;
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).entity = null);
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).context = null);
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).force = false);
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled = false);
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).thinking = false);
		}

		async function triggerColumnSuggestions() {
			// set table info. first!
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).entity = {
				id: page.params.table,
				name: page.data.table?.name ?? 'Table'
			});

			if (!isOnRowsPage()) {
				await goto(resolve('/(console)/project-[region]-[project]/databases/database-[database]/table-[table]', {
					region: page.params.region,
					project: page.params.project,
					database: page.params.database,
					table: page.params.table
				}));
			}

			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).force = true);
			$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled = true);
			show = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Suggest columns',
				onSubmit: triggerColumnSuggestions,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Input($$renderer, { isModal: true });
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Generate columns`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}