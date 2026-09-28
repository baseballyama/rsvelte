import 'svelte/internal/disclose-version';
import { TablesDBIndexType, OrderBy } from '@appwrite.io/console';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { goto, invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
import { remove } from '$lib/helpers/array';
import { addNotification } from '$lib/stores/notifications';
import { isRelationship, isSpatialType } from '$database/table-[table]/rows/store';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import { IconCalendar, IconFingerPrint, IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { getTerminologies } from '$database/(entity)';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { columnOptions as baseColumnOptions } from '$database/table-[table]/columns/store';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="x-button-holder svelte-6z0dj0"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Create($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let showCreateIndex = $.prop($$props, 'showCreateIndex', 15, false),
		externalFieldKey = $.prop($$props, 'externalFieldKey', 3, null);

	let key = $.state('');
	let initializedForOpen = $.state(false);
	let selectedType = $.state($.proxy(TablesDBIndexType.Key));
	const { dependencies, terminology } = getTerminologies();

	const fieldOptions = $.derived(() => $$props.entity.fields.filter((field) => {
		if ($.get(selectedType) === TablesDBIndexType.Spatial) {
			// keep only spatial
			return isSpatialType(field);
		}

		// keep non-relationship and non-spatial
		return !isRelationship(field) && !isSpatialType(field);
	}).map((field) => ({
		value: field.key,
		label: field.key,
		leadingIcon: baseColumnOptions.find((option) => option.type === field.type && option.format === ('format' in field && field.format ? field.format : undefined))?.icon
	})));

	let fieldList = $.state($.proxy([{ value: '', order: null, length: null }]));

	const types = $.derived(() => [
		{ value: TablesDBIndexType.Key, label: 'Key' },
		{ value: TablesDBIndexType.Unique, label: 'Unique' },
		{ value: TablesDBIndexType.Fulltext, label: 'Fulltext' },
		{ value: TablesDBIndexType.Spatial, label: 'Spatial' }
	].filter((type) => {
		if (type.value === TablesDBIndexType.Spatial && !$regionalConsoleVariables()?.supportForSpatials) return false;

		return true;
	}));

	// order options derived from selected type
	let orderOptions = $.derived(() => $.get(selectedType) === TablesDBIndexType.Spatial
		? [
			{ value: OrderBy.Asc, label: 'ASC' },
			{ value: OrderBy.Desc, label: 'DESC' },
			{ value: null, label: 'NONE' }
		]
		: [
			{ value: OrderBy.Asc, label: 'ASC' },
			{ value: OrderBy.Desc, label: 'DESC' }
		]);

	// spatial type selected -> reset field list to single empty field
	// and the field already is not spatial type
	$.user_effect(() => {
		const firstField = $$props.entity.fields.find((field) => field.key === $.get(fieldList).at(0)?.value);

		if ($.get(selectedType) === TablesDBIndexType.Spatial && firstField && !isSpatialType(firstField)) {
			$.set(fieldList, [{ value: '', order: null, length: null }], true);
		}
	});

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
		const field = $$props.entity.fields.filter((field) => externalFieldKey() === field.key);
		const isSpatial = field.length && isSpatialType(field[0]);
		const order = isSpatial ? null : OrderBy.Asc;

		$.set(selectedType, isSpatial ? TablesDBIndexType.Spatial : TablesDBIndexType.Key, true);

		$.set(
			fieldList,
			externalFieldKey()
				? [{ value: externalFieldKey(), order, length: null }]
				: [{ value: '', order, length: null }],
			true
		);

		$.set(key, `index_${$$props.entity.indexes.length + 1}`);
	}

	const addFieldDisabled = $.derived(() => $.get(selectedType) === TablesDBIndexType.Spatial || !$.get(fieldList).at(-1)?.value || !$.get(fieldList).at(-1)?.order && $.get(fieldList).at(-1)?.order !== null);
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

	async function create() {
		const fieldType = terminology.field.lower.singular;

		if (!$.get(key) || !$.get(selectedType) || $.get(selectedType) !== TablesDBIndexType.Spatial && $.get(addFieldDisabled)) {
			addNotification({
				type: 'error',
				message: `Selected ${fieldType} key or type invalid`
			});

			throw new Error(`Selected ${fieldType} key or type invalid`);
		}

		try {
			const orders = $.get(fieldList).map((field) => field.order).filter((order) => order !== null);

			await $$props.onCreateIndex({
				key: $.get(key),
				type: $.get(selectedType),
				fields: $.get(fieldList).map((a) => a.value),
				lengths: $.get(fieldList).map((a) => a.length ? Number(a.length) : null),
				orders: orders.length ? orders : []
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

		// we assign instead of pushing to trigger Svelte's reactivity
		$.set(
			fieldList,
			[
				...$.get(fieldList),
				{ value: '', order: null, length: null }
			],
			true
		);
	}

	var $$exports = { create };
	var fragment = root_4();
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
				var fragment_1 = root_3();
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
								var fragment_3 = root_2();
								var node_5 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => [
										...$.get(selectedType) === TablesDBIndexType.Spatial
											? []
											: [
												{ value: '$id', label: '$id', leadingIcon: IconFingerPrint },
												{
													value: '$createdAt',
													label: '$createdAt',
													leadingIcon: IconCalendar
												},

												{
													value: '$updatedAt',
													label: '$updatedAt',
													leadingIcon: IconCalendar
												}
											],
										...$.get(fieldOptions)
									]);

									let $1 = $.derived(() => index === 0 ? $.get(fieldType) : undefined);

									InputSelect(node_5, {
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

								var node_6 = $.sibling(node_5, 2);

								InputSelect(node_6, {
									get options() {
										return $.get(orderOptions);
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

								var node_7 = $.sibling(node_6, 2);

								{
									var consequent = ($$anchor) => {
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

									$.if(node_7, ($$render) => {
										if ($.get(selectedType) === TablesDBIndexType.Key) $$render(consequent);
									});
								}

								var node_8 = $.sibling(node_7, 2);

								{
									var consequent_1 = ($$anchor) => {
										var div = root();

										$.set_style(div, '', {}, { 'margin-top': '0.25rem' });

										var node_9 = $.child(div);

										{
											let $0 = $.derived(() => $.get(fieldList).length <= 1);

											Button(node_9, {
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

									var alternate = ($$anchor) => {
										var div_1 = root_1();

										$.set_style(div_1, '', {}, { 'margin-top': '27.6px' });

										var node_10 = $.child(div_1);

										{
											let $0 = $.derived(() => $.get(fieldList).length <= 1);

											Button(node_10, {
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

									$.if(node_8, ($$render) => {
										if ($isSmallViewport()) $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				var div_2 = $.sibling(node_3, 2);
				var node_11 = $.child(div_2);

				Button(node_11, {
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