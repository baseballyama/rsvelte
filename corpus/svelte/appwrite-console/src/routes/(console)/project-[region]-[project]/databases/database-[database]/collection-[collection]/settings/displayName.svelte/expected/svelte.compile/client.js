import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { page } from '$app/state';
import { getTerminologies } from '$database/(entity)';
import ColumnDisplayNameInput from '../(components)/inputs/displayName.svelte';

export default function DisplayName($$anchor, $$props) {
	$.push($$props, true);

	const collectionId = page.params.collection;
	const { terminology } = getTerminologies();
	let columnDisplayNameInput = $.state(null);

	Form($$anchor, {
		onSubmit: async () => {
			await $.get(columnDisplayNameInput)?.updateDisplayNames();
		},

		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add up to 5 document fields to display as columns in the collection view.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Custom columns');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						$.bind_this(
							ColumnDisplayNameInput($$anchor, {
								get collectionId() {
									return collectionId;
								},

								get databaseType() {
									return terminology.type;
								},

								onSuccess: async () => {
									await invalidate(Dependencies.TEAM);
									addNotification({ message: 'Display names have been updated', type: 'success' });
									trackEvent(Submit.CollectionUpdateDisplayNames);
								},

								onFailure: (error) => {
									addNotification({ message: error.message, type: 'error' });
									trackError(error, Submit.CollectionUpdateDisplayNames);
								}
							}),
							($$value) => $.set(columnDisplayNameInput, $$value, true),
							() => $.get(columnDisplayNameInput)
						);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(columnDisplayNameInput)?.hasChanged());

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Update');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}