import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { getTerminologies } from '$database/(entity)';
import { Typography } from '@appwrite.io/pink-svelte';
import { trackError, trackEvent } from '$lib/actions/analytics';
import { BoxAvatar, CardGrid, Confirm } from '$lib/components';
import { subNavigation } from '$lib/stores/database';
import { addNotification } from '$lib/stores/notifications';
import { preferences } from '$lib/stores/preferences';
import { navigate } from '$lib/stores/navigation';
import { page } from '$app/state';
import { organization } from '$lib/stores/organization';
import { invalidate } from '$app/navigation';

export default function Danger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { entity, onDelete } = $$props;
		let show = false;
		let error = null;
		const { analytics, dependencies, terminology } = getTerminologies();
		const type = terminology.entity.lower.singular;
		const records = terminology.record.lower.plural;

		async function cleanup() {
			show = false; // hide.
			subNavigation.update(); // update the side entity table.

			// events and notif!
			trackEvent(analytics.submit.entity('Delete'));

			addNotification({ type: 'success', message: `${entity.name} has been deleted` });

			// clear out!
			await Promise.all([
				preferences.deleteEntityDetails($.store_get($$store_subs ??= {}, '$organization', organization).$id, entity.$id),
				navigate('/(console)/project-[region]-[project]/databases/database-[database]', page.params)
			]);

			// invalidate proper dependency.
			await invalidate(dependencies.entity.singular);
		}

		async function deleteEntity() {
			try {
				await onDelete();
				await cleanup();
			} catch(e) {
				error = e.message;
				trackError(e, analytics.submit.entity('Delete'));
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The ${$.escape(type)} will be permanently deleted, including all the ${$.escape(records)} within it. This action is irreversible.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete ${$.escape(type)}`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Last updated: ${$.escape(toLocaleDateTime(entity.$updatedAt))}</p>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`<h6 class="u-bold u-trim-1">${$.escape(entity.name)}</h6>`);
										}
									}
								}
							});
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (show) {
				$$renderer.push('<!--[0-->');

				Confirm($$renderer, {
					confirmDeletion: true,
					onSubmit: deleteEntity,
					title: `Delete ${$.stringify(type)}`,
					get open() {
						return show;
					},

					set open($$value) {
						show = $$value;
						$$settled = false;
					},

					get error() {
						return error;
					},

					set error($$value) {
						error = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Typography.Text) {
							$$renderer.push('<!--[-->');

							Typography.Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Are you sure you want to delete <b>${$.escape(entity.name)}</b>?`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}