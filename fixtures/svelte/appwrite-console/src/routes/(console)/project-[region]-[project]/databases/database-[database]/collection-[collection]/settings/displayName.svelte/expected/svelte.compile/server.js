import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { page } from '$app/state';
import { getTerminologies } from '$database/(entity)';
import ColumnDisplayNameInput from '../(components)/inputs/displayName.svelte';

export default function DisplayName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const collectionId = page.params.collection;
		const { terminology } = getTerminologies();
		let columnDisplayNameInput = null;

		Form($$renderer, {
			onSubmit: async () => {
				await columnDisplayNameInput?.updateDisplayNames();
			},

			children: ($$renderer) => {
				CardGrid($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add up to 5 document fields to display as columns in the collection view.`);
					},

					$$slots: {
						default: true,
						title: ($$renderer) => {
							{
								$$renderer.push(`Custom columns`);
							}
						},

						aside: ($$renderer) => {
							{
								ColumnDisplayNameInput($$renderer, {
									collectionId,
									databaseType: terminology.type,
									onSuccess: async () => {
										await invalidate(Dependencies.TEAM);
										addNotification({ message: 'Display names have been updated', type: 'success' });
										trackEvent(Submit.CollectionUpdateDisplayNames);
									},

									onFailure: (error) => {
										addNotification({ message: error.message, type: 'error' });
										trackError(error, Submit.CollectionUpdateDisplayNames);
									}
								});
							}
						},

						actions: ($$renderer) => {
							{
								Button($$renderer, {
									disabled: columnDisplayNameInput?.hasChanged(),
									submit: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Update`);
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
	});
}