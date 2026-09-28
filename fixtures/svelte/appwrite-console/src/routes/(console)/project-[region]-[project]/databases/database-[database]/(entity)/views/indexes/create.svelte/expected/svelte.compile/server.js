import * as $ from 'svelte/internal/server';
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
import { TablesDBIndexType, OrderBy } from '@appwrite.io/console';

export default function Create($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			entity,
			showCreateIndex = false,
			externalFieldKey = null,
			onCreateIndex
		} = $$props;

		let key = '';
		let initializedForOpen = false;
		let selectedType = TablesDBIndexType.Key;
		const { dependencies, terminology } = getTerminologies();

		const fieldOptions = $.derived(() => entity.fields.filter((field) => {
			if (selectedType === TablesDBIndexType.Spatial) {
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

		let fieldList = [{ value: '', order: null, length: null }];

		const types = $.derived(() => [
			{ value: TablesDBIndexType.Key, label: 'Key' },
			{ value: TablesDBIndexType.Unique, label: 'Unique' },
			{ value: TablesDBIndexType.Fulltext, label: 'Fulltext' },
			{ value: TablesDBIndexType.Spatial, label: 'Spatial' }
		].filter((type) => {
			if (type.value === TablesDBIndexType.Spatial && !$.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)?.supportForSpatials) return false;

			return true;
		}));

		// order options derived from selected type
		let orderOptions = $.derived(() => selectedType === TablesDBIndexType.Spatial
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
		function generateIndexKey() {
			let indexKeys = entity.indexes.map((index) => index.key);

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
			const field = entity.fields.filter((field) => externalFieldKey === field.key);
			const isSpatial = field.length && isSpatialType(field[0]);
			const order = isSpatial ? null : OrderBy.Asc;

			selectedType = isSpatial ? TablesDBIndexType.Spatial : TablesDBIndexType.Key;

			fieldList = externalFieldKey
				? [{ value: externalFieldKey, order, length: null }]
				: [{ value: '', order, length: null }];

			key = `index_${entity.indexes.length + 1}`;
		}

		const addFieldDisabled = $.derived(() => selectedType === TablesDBIndexType.Spatial || !fieldList.at(-1)?.value || !fieldList.at(-1)?.order && fieldList.at(-1)?.order !== null);
		const isOnIndexesPage = $.derived(() => page.route.id?.endsWith('/indexes'));

		const navigatorPathToIndexes = $.derived(() => {
			const type = terminology.entity.lower.singular;
			const base = resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params);

			return withPath(base, `${type}-${entity.$id}`, 'indexes');
		});

		async function create() {
			const fieldType = terminology.field.lower.singular;

			if (!key || !selectedType || selectedType !== TablesDBIndexType.Spatial && addFieldDisabled()) {
				addNotification({
					type: 'error',
					message: `Selected ${fieldType} key or type invalid`
				});

				throw new Error(`Selected ${fieldType} key or type invalid`);
			}

			try {
				const orders = fieldList.map((field) => field.order).filter((order) => order !== null);

				await onCreateIndex({
					key,
					type: selectedType,
					fields: fieldList.map((a) => a.value),
					lengths: fieldList.map((a) => a.length ? Number(a.length) : null),
					orders: orders.length ? orders : []
				});

				await Promise.allSettled([
					invalidate(dependencies.entity.singular),
					invalidate(Dependencies.DATABASE)
				]);

				addNotification({
					message: 'Index is being created',
					type: 'success',
					buttons: !isOnIndexesPage()
						? [
							{
								name: 'View indexes',
								method: () => goto(navigatorPathToIndexes())
							}
						]
						: undefined
				});

				trackEvent(Submit.IndexCreate, { type: 'manual' });
				showCreateIndex = false;
			} catch(err) {
				addNotification({ type: 'error', message: err.message });
				trackError(err, Submit.IndexCreate);

				throw err;
			}
		}

		function addField() {
			if (addFieldDisabled()) return;

			// we assign instead of pushing to trigger Svelte's reactivity
			fieldList = [...fieldList, { value: '', order: null, length: null }];
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			InputText($$renderer, {
				required: true,
				id: 'key',
				label: 'Index Key',
				pattern: '^[A-Za-z0-9][A-Za-z0-9._\\-]*$',
				placeholder: 'Enter Key',
				autofocus: true,
				get value() {
					return key;
				},

				set value($$value) {
					key = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			InputSelect($$renderer, {
				required: true,
				id: 'type',
				options: types(),
				label: 'Index type',
				get value() {
					return selectedType;
				},

				set value($$value) {
					selectedType = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					children: ($$renderer) => {
						const fieldType = terminology.field.title.singular;
						const fieldTypeLower = terminology.field.lower.singular;

						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(fieldList);

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let field = each_array[index];
							const direction = $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row';

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction,
									children: ($$renderer) => {
										InputSelect($$renderer, {
											required: true,
											options: [
												...selectedType === TablesDBIndexType.Spatial
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
												...fieldOptions()
											],
											id: `field-${index}`,
											label: index === 0 ? fieldType : undefined,
											placeholder: `Select ${$.stringify(fieldType)}`,
											get value() {
												return field.value;
											},

											set value($$value) {
												field.value = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputSelect($$renderer, {
											options: orderOptions(),
											required: true,
											id: `order-${index}`,
											label: index === 0 ? 'Order' : undefined,
											placeholder: 'Select order',
											get value() {
												return field.order;
											},

											set value($$value) {
												field.order = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (selectedType === TablesDBIndexType.Key) {
											$$renderer.push('<!--[0-->');

											InputNumber($$renderer, {
												id: `length-${index}`,
												label: index === 0 ? 'Length' : undefined,
												placeholder: 'Enter length',
												get value() {
													return field.length;
												},

												set value($$value) {
													field.length = $$value;
													$$settled = false;
												}
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
											$$renderer.push(`<!--[0--><div${$.attr_style('', { 'margin-top': '0.25rem' })}>`);

											Button($$renderer, {
												text: true,
												secondary: true,
												disabled: fieldList.length <= 1,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Remove`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="x-button-holder svelte-6z0dj0"${$.attr_style('', { 'margin-top': '27.6px' })}>`);

											Button($$renderer, {
												icon: true,
												size: 's',
												secondary: true,
												disabled: fieldList.length <= 1,
												children: ($$renderer) => {
													Icon($$renderer, { icon: IconX, size: 's' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]--> <div>`);

						Button($$renderer, {
							compact: true,
							disabled: addFieldDisabled(),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Add ${$.escape(fieldTypeLower)}`);
							},

							$$slots: {
								default: true,
								start: ($$renderer) => {
									Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
								}
							}
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { showCreateIndex, create });
	});
}