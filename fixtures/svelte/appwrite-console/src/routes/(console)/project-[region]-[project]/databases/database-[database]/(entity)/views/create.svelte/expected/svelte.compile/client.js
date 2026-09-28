import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Create($$anchor, $$props) {
	$.push($$props, true);

	const $entityColumnSuggestions = () => $.store_get(entityColumnSuggestions, '$entityColumnSuggestions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		useSuggestions = $.prop($$props, 'useSuggestions', 3, true);

	const { analytics, terminology } = getTerminologies();
	const lower = terminology.entity.lower.singular;
	const title = terminology.entity.title.singular;
	const analyticsCreateSubmit = analytics.submit.entity('Create');
	const isVectorsDb = terminology.type === 'vectorsdb';

	// example - `table-[table]`, `collection-[collection]`
	const isOnEntitiesPage = $.derived(() => page.route?.id.endsWith(`${lower}-[${lower}]`));

	let name = $.state('');
	let id = $.state(null);
	let dimension = $.state($.proxy(DEFAULT_VECTOR_DIMENSION));
	let error = $.state(null);
	let creatingEntity = $.state(false);

	function enableThinkingModeForSuggestions(id, name) {
		if (!useSuggestions()) return;

		if ($entityColumnSuggestions().enabled) {
			// if enabled, trigger thinking mode!
			entityColumnSuggestions.update((store) => ({ ...store, thinking: true, entity: { id, name } }));
		}
	}

	async function createEntity() {
		$.set(error, null);
		$.set(creatingEntity, true);

		let createdEntity = false;

		try {
			const finalId = $.get(id) || ID.unique();

			// early init setup!
			enableThinkingModeForSuggestions(finalId, $.get(name));

			// create entity.
			await $$props.onCreateEntity(finalId, $.get(name), isVectorsDb ? $.get(dimension) : undefined);

			createdEntity = true;

			// cleanup
			updateAndCleanup();
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, analyticsCreateSubmit);
		} finally {
			$.set(creatingEntity, false);

			if (!createdEntity || !$entityColumnSuggestions().enabled) {
				resetSampleFieldsConfig();
			}
		}
	}

	function updateAndCleanup() {
		subNavigation.update();
		addNotification({ type: 'success', message: `${$.get(name)} has been created` });
		trackEvent(analyticsCreateSubmit, { customId: !!$.get(id) });
		$.set(id, null);
		$.set(name, '');
		show(false);
	}

	$.user_effect(() => {
		if (!show()) {
			$.set(id, null);
			$.set(error, null);
		}
	});

	$.user_effect(() => {
		// reset is OK here, we don't have to check for entity type!
		if (show() && !$.get(creatingEntity) && $.get(isOnEntitiesPage) && $entityColumnSuggestions().entity) {
			entityColumnSuggestions.update((store) => ({ ...store, entity: null }));
		}
	});

	Modal($$anchor, {
		size: 'm',
		get title() {
			return `Create ${lower ?? ''}`;
		},
		onSubmit: createEntity,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			InputText(node, {
				id: 'name',
				label: 'Name',
				get placeholder() {
					return `Enter ${lower ?? ''} name`;
				},
				autofocus: true,
				required: true,
				get value() {
					return $.get(name);
				},

				set value($$value) {
					$.set(name, $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			CustomId(node_1, {
				show: true,
				required: false,
				autofocus: false,
				get name() {
					return title;
				},

				get syncFrom() {
					return $.get(name);
				},

				get id() {
					return $.get(id);
				},

				set id($$value) {
					$.set(id, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					InputNumber($$anchor, {
						id: 'dimension',
						label: 'Vector dimension',
						min: 1,
						max: 4096,
						required: true,
						get value() {
							return $.get(dimension);
						},

						set value($$value) {
							$.set(dimension, $$value, true);
						}
					});
				};

				$.if(node_2, ($$render) => {
					if (isVectorsDb) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => !terminology.schema);

						SuggestionsInput($$anchor, {
							get showSampleCountPicker() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_3, ($$render) => {
					if (useSuggestions()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_4 = $.first_child(fragment_4);

				Button(node_4, {
					secondary: true,
					get disabled() {
						return $.get(creatingEntity);
					},
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Button(node_5, {
					submit: true,
					get disabled() {
						return $.get(creatingEntity);
					},
					submissionLoader: true,
					get forceShowLoader() {
						return $.get(creatingEntity);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Create');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.pop();
	$$cleanup();
}