import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Permissions } from '$lib/components/permissions';
import { Button } from '$lib/elements/forms';
import { symmetricDifference } from '$lib/helpers/array';
import { addNotification } from '$lib/stores/notifications';
import { Link } from '@appwrite.io/pink-svelte';
import { getTerminologies } from '$database/(entity)';

var root = $.from_html(` <!>.`, 1);

export default function Permissions_1($$anchor, $$props) {
	$.push($$props, true);

	let entityPermissions = $.state($.proxy($$props.entity.$permissions));
	const { analytics, dependencies, terminology } = getTerminologies();
	const type = terminology.entity.lower.singular;
	const records = terminology.record.lower.plural;

	async function cleanup() {
		// events and notif!
		trackEvent(analytics.submit.entity('UpdatePermissions'));

		addNotification({
			message: `${$$props.entity.name} has been updated`,
			type: 'success'
		});

		// invalidate proper dependency.
		await invalidate(dependencies.entity.singular);
	}

	async function updatePermissions() {
		try {
			await $$props.onChangePermissions($.get(entityPermissions));
			await cleanup();
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, analytics.submit.entity('UpdatePermissions'));
		}
	}

	const arePermsDisabled = $.derived(() => !($.get(entityPermissions) && symmetricDifference($.get(entityPermissions), $$props.entity.$permissions).length));

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var text = $.first_child(fragment_1);
			var node = $.sibling(text);

			$.component(node, () => Link.Anchor, ($$anchor, Link_Anchor) => {
				Link_Anchor($$anchor, {
					href: 'https://appwrite.io/docs/products/databases/permissions',
					target: '_blank',
					rel: 'noopener noreferrer',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Learn more');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.next();
			$.template_effect(() => $.set_text(text, `Choose who can access your ${type ?? ''} and ${records ?? ''}. `));
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_2 = $.text('Permissions');

				$.append($$anchor, text_2);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						Permissions($$anchor, {
							withCreate: true,
							get permissions() {
								return $.get(entityPermissions);
							},

							set permissions($$value) {
								$.set(entityPermissions, $$value, true);
							}
						});
					};

					$.if(node_1, ($$render) => {
						if ($.get(entityPermissions)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					get disabled() {
						return $.get(arePermsDisabled);
					},
					$$events: { click: updatePermissions },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Update');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.pop();
}