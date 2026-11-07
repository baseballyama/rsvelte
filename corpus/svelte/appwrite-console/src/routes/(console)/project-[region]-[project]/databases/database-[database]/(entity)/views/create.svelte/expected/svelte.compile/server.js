import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { Modal, CustomId } from '$lib/components';
import { subNavigation } from '$lib/stores/database';
import { ID } from '@appwrite.io/console';
import { Button, InputNumber, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { Input as SuggestionsInput, entityColumnSuggestions } from '$database/(suggestions)/index';
import { getTerminologies, DEFAULT_VECTOR_DIMENSION } from '$database/(entity)';
import { resetSampleFieldsConfig } from '$database/store';

export default function Create($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, useSuggestions = true, onCreateEntity } = $$props;
		const { analytics, terminology } = getTerminologies();
		const lower = terminology.entity.lower.singular;
		const title = terminology.entity.title.singular;
		const analyticsCreateSubmit = analytics.submit.entity('Create');
		const isVectorsDb = terminology.type === 'vectorsdb';

		// example - `table-[table]`, `collection-[collection]`
		const isOnEntitiesPage = $.derived(() => page.route?.id.endsWith(`${lower}-[${lower}]`));

		let name = '';
		let id = null;
		let dimension = DEFAULT_VECTOR_DIMENSION;
		let error = null;
		let creatingEntity = false;

		function enableThinkingModeForSuggestions(id, name) {
			if (!useSuggestions) return;

			if ($.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled) {
				// if enabled, trigger thinking mode!
				entityColumnSuggestions.update((store) => ({ ...store, thinking: true, entity: { id, name } }));
			}
		}

		async function createEntity() {
			error = null;
			creatingEntity = true;

			let createdEntity = false;

			try {
				const finalId = id || ID.unique();

				// early init setup!
				enableThinkingModeForSuggestions(finalId, name);

				// create entity.
				await onCreateEntity(finalId, name, isVectorsDb ? dimension : undefined);

				createdEntity = true;

				// cleanup
				updateAndCleanup();
			} catch(e) {
				error = e.message;
				trackError(e, analyticsCreateSubmit);
			} finally {
				creatingEntity = false;

				if (!createdEntity || !$.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled) {
					resetSampleFieldsConfig();
				}
			}
		}

		function updateAndCleanup() {
			subNavigation.update();
			addNotification({ type: 'success', message: `${name} has been created` });
			trackEvent(analyticsCreateSubmit, { customId: !!id });
			id = null;
			name = '';
			show = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				size: 'm',
				title: `Create ${$.stringify(lower)}`,
				onSubmit: createEntity,
				get show() {
					return show;
				},

				set show($$value) {
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
					InputText($$renderer, {
						id: 'name',
						label: 'Name',
						placeholder: `Enter ${$.stringify(lower)} name`,
						autofocus: true,
						required: true,
						get value() {
							return name;
						},

						set value($$value) {
							name = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					CustomId($$renderer, {
						show: true,
						required: false,
						autofocus: false,
						name: title,
						syncFrom: name,
						get id() {
							return id;
						},

						set id($$value) {
							id = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					if (isVectorsDb) {
						$$renderer.push('<!--[0-->');

						InputNumber($$renderer, {
							id: 'dimension',
							label: 'Vector dimension',
							min: 1,
							max: 4096,
							required: true,
							get value() {
								return dimension;
							},

							set value($$value) {
								dimension = $$value;
								$$settled = false;
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (useSuggestions) {
						$$renderer.push('<!--[0-->');
						SuggestionsInput($$renderer, { showSampleCountPicker: !terminology.schema });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								disabled: creatingEntity,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								disabled: creatingEntity,
								submissionLoader: true,
								forceShowLoader: creatingEntity,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create`);
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