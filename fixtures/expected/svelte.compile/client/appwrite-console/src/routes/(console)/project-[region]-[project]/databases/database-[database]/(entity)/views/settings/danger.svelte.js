import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<h6 class="u-bold u-trim-1"> </h6>`);
var root_2 = $.from_html(`Are you sure you want to delete <b> </b>?`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Danger($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let show = $.state(false);
	let error = $.state(null);
	const { analytics, dependencies, terminology } = getTerminologies();
	const type = terminology.entity.lower.singular;
	const records = terminology.record.lower.plural;

	async function cleanup() {
		$.set(show, false // hide.
		);
		subNavigation.update(); // update the side entity table.

		// events and notif!
		trackEvent(analytics.submit.entity('Delete'));

		addNotification({
			type: 'success',
			message: `${$$props.entity.name} has been deleted`
		});

		// clear out!
		await Promise.all([
			preferences.deleteEntityDetails($organization().$id, $$props.entity.$id),
			navigate('/(console)/project-[region]-[project]/databases/database-[database]', page.params)
		]);

		// invalidate proper dependency.
		await invalidate(dependencies.entity.singular);
	}

	async function deleteEntity() {
		try {
			await $$props.onDelete();
			await cleanup();
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, analytics.submit.entity('Delete'));
		}
	}

	var fragment = root_3();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `The ${type ?? ''} will be permanently deleted, including all the ${records ?? ''} within it. This action is irreversible.`));
			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, `Delete ${type ?? ''}`));
				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var p = root();
						var text_2 = $.only_child(p);

						$.template_effect(($0) => $.set_text(text_2, `Last updated: ${$0 ?? ''}`), [() => toLocaleDateTime($$props.entity.$updatedAt)]);
						$.append($$anchor, p);
					},

					$$slots: {
						default: true,
						title: ($$anchor, $$slotProps) => {
							var h6 = root_1();
							var text_3 = $.only_child(h6, true);

							$.template_effect(() => $.set_text(text_3, $$props.entity.name));
							$.append($$anchor, h6);
						}
					}
				});
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					$$events: {
						click: () => {
							$.set(show, true);
							trackEvent(analytics.click.entity('Delete'));
						}
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Delete');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Confirm($$anchor, {
				confirmDeletion: true,
				onSubmit: deleteEntity,
				get title() {
					return `Delete ${type ?? ''}`;
				},

				get open() {
					return $.get(show);
				},

				set open($$value) {
					$.set(show, $$value, true);
				},

				get error() {
					return $.get(error);
				},

				set error($$value) {
					$.set(error, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = $.comment();
					var node_2 = $.first_child(fragment_6);

					$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
						Typography_Text($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_7 = root_2();
								var b = $.sibling($.first_child(fragment_7));
								var text_5 = $.only_child(b, true);

								$.next();
								$.template_effect(() => $.set_text(text_5, $$props.entity.name));
								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}