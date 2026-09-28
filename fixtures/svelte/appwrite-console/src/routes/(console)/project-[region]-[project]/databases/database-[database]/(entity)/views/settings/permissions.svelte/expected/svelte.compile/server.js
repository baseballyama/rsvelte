import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Permissions } from '$lib/components/permissions';
import { Button } from '$lib/elements/forms';
import { symmetricDifference } from '$lib/helpers/array';
import { addNotification } from '$lib/stores/notifications';
import { Link } from '@appwrite.io/pink-svelte';
import { getTerminologies } from '$database/(entity)';

export default function Permissions_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { entity, onChangePermissions } = $$props;
		let entityPermissions = entity.$permissions;
		const { analytics, dependencies, terminology } = getTerminologies();
		const type = terminology.entity.lower.singular;
		const records = terminology.record.lower.plural;

		async function cleanup() {
			// events and notif!
			trackEvent(analytics.submit.entity('UpdatePermissions'));

			addNotification({ message: `${entity.name} has been updated`, type: 'success' });

			// invalidate proper dependency.
			await invalidate(dependencies.entity.singular);
		}

		async function updatePermissions() {
			try {
				await onChangePermissions(entityPermissions);
				await cleanup();
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, analytics.submit.entity('UpdatePermissions'));
			}
		}

		const arePermsDisabled = $.derived(() => !(entityPermissions && symmetricDifference(entityPermissions, entity.$permissions).length));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose who can access your ${$.escape(type)} and ${$.escape(records)}. `);

					if (Link.Anchor) {
						$$renderer.push('<!--[-->');

						Link.Anchor($$renderer, {
							href: 'https://appwrite.io/docs/products/databases/permissions',
							target: '_blank',
							rel: 'noopener noreferrer',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Learn more`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Permissions`);
						}
					},

					aside: ($$renderer) => {
						{
							if (entityPermissions) {
								$$renderer.push('<!--[0-->');

								Permissions($$renderer, {
									withCreate: true,
									get permissions() {
										return entityPermissions;
									},

									set permissions($$value) {
										entityPermissions = $$value;
										$$settled = false;
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								disabled: arePermsDisabled(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});
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
	});
}