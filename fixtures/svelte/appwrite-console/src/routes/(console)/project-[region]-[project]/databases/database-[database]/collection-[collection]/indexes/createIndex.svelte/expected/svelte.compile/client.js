import 'svelte/internal/disclose-version';
import { DocumentsDBIndexType, VectorsDBIndexType, OrderBy } from '@appwrite.io/console';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { goto, invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
import { remove } from '$lib/helpers/array';
import { addNotification } from '$lib/stores/notifications';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { getTerminologies } from '$database/(entity)';
import { resolveRoute, withPath } from '$lib/stores/navigation';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div class="x-button-holder svelte-dxmit2"><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function CreateIndex($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let showCreateIndex = $.prop($$props, 'showCreateIndex', 15, false),
		externalFieldKey = $.prop($$props, 'externalFieldKey', 3, null);

	let key = $.state('');
	let initializedForOpen = $.state(false);
	let selectedType = $.state($.proxy($$props.databaseType === 'vectorsdb' ? VectorsDBIndexType.Key : DocumentsDBIndexType.Key));
	const { dependencies, terminology } = getTerminologies();

	const types = $.derived(() => {
		if ($$props.databaseType === 'vectorsdb') {
			return [
				{ value: VectorsDBIndexType.Key, label: 'Key' },
				{ value: VectorsDBIndexType.Unique, label: 'Unique' },
				{
					value: VectorsDBIndexType.HnswEuclidean,
					label: 'HNSW Euclidean'
				},
				{ value: VectorsDBIndexType.HnswDot, label: 'HNSW Dot' },
				{ value: VectorsDBIndexType.HnswCosine, label: 'HNSW Cosine' },
				{ value: VectorsDBIndexType.Object, label: 'Object' }
			];
		}

		return [
			{ value: DocumentsDBIndexType.Key, label: 'Key' },
			{ value: DocumentsDBIndexType.Unique, label: 'Unique' },
			{ value: DocumentsDBIndexType.Fulltext, label: 'Fulltext' }
		];
	});

	const isHnswType = $.derived(() => [
		VectorsDBIndexType.HnswEuclidean,
		VectorsDBIndexType.HnswDot,
		VectorsDBIndexType.HnswCosine
	].includes($.get(selectedType)));

	const isObjectType = $.derived(() => $.get(selectedType) === VectorsDBIndexType.Object);
	const fieldOptions = $.derived(() => ($$props.entity.fields ?? []).map((field) => ({ value: field.key, label: field.key })));
	let fieldList = $.state($.proxy([{ value: '', order: OrderBy.Asc, length: null }]));

	const orderOptions = [
		{ value: OrderBy.Asc, label: 'ASC' },
		{ value: OrderBy.Desc, label: 'DESC' }
	];

	function generateIndexKey() {
		let indexKeys = $$props.entity.indexes.map((index) => index.key);

		let highestIndex = indexKeys.reduce(
			(max, key) => {
				const match = key.match(/^index_(\d+)$/);

				return match ? Math.max(max, parseInt(match[1], 10)) : max;
			},
			indexKeys.length
		);

		return `index_${highestIndex + 1}`;
	}

	function initialize() {
		$.set(selectedType, $$props.databaseType === 'vectorsdb' ? VectorsDBIndexType.Key : DocumentsDBIndexType.Key, true);

		$.set(
			fieldList,
			externalFieldKey()
				? [
					{ value: externalFieldKey(), order: OrderBy.Asc, length: null }
				]
				: [{ value: '', order: OrderBy.Asc, length: null }],
			true
		);

		$.set(key, `index_${$$props.entity.indexes.length + 1}`);
	}

	const addFieldDisabled = $.derived(() => $.get(isHnswType) || $.get(isObjectType) || !$.get(fieldList).at(-1)?.value || !$.get(isObjectType) && !$.get(fieldList).at(-1)?.order);
	const isOnIndexesPage = $.derived(() => page.route.id?.endsWith('/indexes'));

	const navigatorPathToIndexes = $.derived(() => {
		const type = terminology.entity.lower.singular;
		const base = resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params);

		return withPath(base, `${type}-${$$props.entity.$id}`, 'indexes');
	});

	$.user_effect(() => {
		if (showCreateIndex() && !$.get(initializedForOpen)) {
			initialize();
			$.set(key, generateIndexKey(), true);
			$.set(initializedForOpen, true);
		}

		if (!showCreateIndex() && $.get(initializedForOpen)) {
			$.set(initializedForOpen, false);
		}
	});

	// HNSW indexes: auto-fill embeddings, single field only.
	// When switching away to Key/Unique, reset stale `order: null` left over from HNSW.
	$.user_effect(() => {
		if ($.get(isHnswType)) {
			$.set(fieldList, [{ value: 'embeddings', order: null, length: null }], true);
		} else if (!$.get(isObjectType) && $.get(fieldList).some((f) => f.order === null)) {
			$.set(fieldList, [{ value: '', order: OrderBy.Asc, length: null }], true);
		}
	});

	async function create() {
		const fieldType = terminology.field.lower.singular;

		if (!$.get(key) || !$.get(selectedType) || !$.get(isHnswType) && !$.get(isObjectType) && $.get(addFieldDisabled) || ($.get(isHnswType) || $.get(isObjectType)) && !$.get(fieldList).at(0)?.value) {
			addNotification({
				type: 'error',
				message: `Selected ${fieldType} key or type invalid`
			});

			throw new Error(`Selected ${fieldType} key or type invalid`);
		}

		try {
			await $$props.onCreateIndex({
				key: $.get(key),
				type: $.get(selectedType),
				fields: $.get(fieldList).map((a) => a.value),
				lengths: $.get(isHnswType) || $.get(isObjectType)
					? []
					: $.get(fieldList).map((a) => a.length ? Number(a.length) : null),

				orders: $.get(isHnswType) || $.get(isObjectType)
					? []
					: $.get(fieldList).map((a) => a.order).filter((order) => order !== null)
			});

			await Promise.allSettled([
				invalidate(dependencies.entity.singular),
				invalidate(Dependencies.DATABASE)
			]);

			addNotification({
				message: 'Index is being created',
				type: 'success',
				buttons: !$.get(isOnIndexesPage)
					? [
						{
							name: 'View indexes',
							method: () => goto($.get(navigatorPathToIndexes))
						}
					]
					: undefined
			});

			trackEvent(Submit.IndexCreate, { type: 'manual' });
			showCreateIndex(false);
		} catch(err) {
			addNotification({ type: 'error', message: err.message });
			trackError(err, Submit.IndexCreate);

			throw err;
		}
	}

	function addField() {
		if ($.get(addFieldDisabled)) return;

		$.set(
			fieldList,
			[
				...$.get(fieldList),
				{ value: '', order: OrderBy.Asc, length: null }
			],
			true
		);
	}

	var $$exports = { create };
	var fragment = root_3();
	var node = $.first_child(fragment);

	InputText(node, {
		required: true,
		id: 'key',
		label: 'Index Key',
		pattern: '^[A-Za-z0-9][A-Za-z0-9._\\-]*$',
		placeholder: 'Enter Key',
		autofocus: true,
		get value() {
			return $.get(key);
		},

		set value($$value) {
			$.set(key, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	InputSelect(node_1, {
		required: true,
		id: 'type',
		get options() {
			return $.get(types);
		},
		label: 'Index type',
		get value() {
			return $.get(selectedType);
		},

		set value($$value) {
			$.set(selectedType, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 's',
			children: ($$anchor, $$slotProps) => {
				const fieldType = $.derived(() => terminology.field.title.singular);
				const fieldTypeLower = $.derived(() => terminology.field.lower.singular);
				var fragment_1 = root();
				var node_3 = $.first_child(fragment_1);

				$.each(node_3, 17, () => $.get(fieldList), $.index, ($$anchor, field, index) => {
					const direction = $.derived(() => $isSmallViewport() ? 'column' : 'row');
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
						Layout_Stack_1($$anchor, {
							get direction() {
								return $.get(direction);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_3();
								var node_5 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										{
											let $0 = $.derived(() => index === 0 ? $.get(fieldType) : undefined);

											InputText($$anchor, {
												required: true,
												disabled: true,
												id: `field-${index}`,
												get label() {
													return $.get($0);
												},

												get value() {
													return $.get(field).value;
												},

												set value($$value) {
													($.get(field).value = $$value);
												}
											});
										}
									};

									var consequent_1 = ($$anchor) => {
										{
											let $0 = $.derived(() => [
												{ value: '$id', label: '$id' },
												{ value: '$createdAt', label: '$createdAt' },
												{ value: '$updatedAt', label: '$updatedAt' },
												...$.get(fieldOptions)
											]);

											let $1 = $.derived(() => index === 0 ? $.get(fieldType) : undefined);

											InputSelect($$anchor, {
												required: true,
												get options() {
													return $.get($0);
												},
												id: `field-${index}`,
												get label() {
													return $.get($1);
												},

												get placeholder() {
													return `Select ${$.get(fieldType) ?? ''}`;
												},

												get value() {
													return $.get(field).value;
												},

												set value($$value) {
													($.get(field).value = $$value);
												}
											});
										}
									};

									var alternate = ($$anchor) => {
										{
											let $0 = $.derived(() => index === 0 ? $.get(fieldType) : undefined);

											InputText($$anchor, {
												required: true,
												id: `field-${index}`,
												get label() {
													return $.get($0);
												},

												get placeholder() {
													return `Enter ${$.get(fieldType) ?? ''} name`;
												},

												get value() {
													return $.get(field).value;
												},

												set value($$value) {
													($.get(field).value = $$value);
												}
											});
										}
									};

									$.if(node_5, ($$render) => {
										if ($.get(isHnswType)) $$render(consequent); else if ($.get(fieldOptions).length) $$render(consequent_1, 1); else $$render(alternate, -1);
									});
								}

								var node_6 = $.sibling(node_5, 2);

								{
									var consequent_3 = ($$anchor) => {
										var fragment_7 = root();
										var node_7 = $.first_child(fragment_7);

										InputSelect(node_7, {
											get options() {
												return orderOptions;
											},
											required: true,
											id: `order-${index}`,
											label: index === 0 ? 'Order' : undefined,
											placeholder: 'Select order',
											get value() {
												return $.get(field).order;
											},

											set value($$value) {
												($.get(field).order = $$value);
											}
										});

										var node_8 = $.sibling(node_7, 2);

										{
											var consequent_2 = ($$anchor) => {
												InputNumber($$anchor, {
													id: `length-${index}`,
													label: index === 0 ? 'Length' : undefined,
													placeholder: 'Enter length',
													get value() {
														return $.get(field).length;
													},

													set value($$value) {
														($.get(field).length = $$value);
													}
												});
											};

											$.if(node_8, ($$render) => {
												if ($.get(selectedType) === DocumentsDBIndexType.Key || $.get(selectedType) === VectorsDBIndexType.Key) $$render(consequent_2);
											});
										}

										$.append($$anchor, fragment_7);
									};

									$.if(node_6, ($$render) => {
										if (!$.get(isHnswType) && !$.get(isObjectType)) $$render(consequent_3);
									});
								}

								var node_9 = $.sibling(node_6, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div = root_1();

										$.set_style(div, '', {}, { 'margin-top': '0.25rem' });

										var node_10 = $.child(div);

										{
											let $0 = $.derived(() => $.get(fieldList).length <= 1);

											Button(node_10, {
												text: true,
												secondary: true,
												get disabled() {
													return $.get($0);
												},

												$$events: {
													click: () => {
														$.set(fieldList, remove($.get(fieldList), index), true);
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Remove');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										}

										$.reset(div);
										$.append($$anchor, div);
									};

									var alternate_1 = ($$anchor) => {
										var div_1 = root_2();

										$.set_style(div_1, '', {}, { 'margin-top': '27.6px' });

										var node_11 = $.child(div_1);

										{
											let $0 = $.derived(() => $.get(fieldList).length <= 1);

											Button(node_11, {
												icon: true,
												size: 's',
												secondary: true,
												get disabled() {
													return $.get($0);
												},

												$$events: {
													click: () => {
														$.set(fieldList, remove($.get(fieldList), index), true);
													}
												},

												children: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconX;
														},
														size: 's'
													});
												},
												$$slots: { default: true }
											});
										}

										$.reset(div_1);
										$.append($$anchor, div_1);
									};

									$.if(node_9, ($$render) => {
										if ($isSmallViewport()) $$render(consequent_4); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				var node_12 = $.sibling(node_3, 2);

				{
					var consequent_5 = ($$anchor) => {
						var div_2 = root_1();
						var node_13 = $.child(div_2);

						Button(node_13, {
							compact: true,
							get disabled() {
								return $.get(addFieldDisabled);
							},
							$$events: { click: addField },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, `Add ${$.get(fieldTypeLower) ?? ''}`));
								$.append($$anchor, text_1);
							},

							$$slots: {
								default: true,
								start: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get icon() {
											return IconPlus;
										},
										slot: 'start',
										size: 's'
									});
								}
							}
						});

						$.reset(div_2);
						$.append($$anchor, div_2);
					};

					$.if(node_12, ($$render) => {
						if (!$.get(isHnswType) && !$.get(isObjectType)) $$render(consequent_5);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}