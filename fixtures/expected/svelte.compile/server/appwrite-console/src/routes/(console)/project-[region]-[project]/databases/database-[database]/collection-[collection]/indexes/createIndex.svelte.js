import * as $ from 'svelte/internal/server';
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
import { DocumentsDBIndexType, VectorsDBIndexType, OrderBy } from '@appwrite.io/console';

export default function CreateIndex($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			entity,
			databaseType,
			showCreateIndex = false,
			externalFieldKey = null,
			onCreateIndex
		} = $$props;

		let key = '';
		let initializedForOpen = false;
		let selectedType = databaseType === 'vectorsdb' ? VectorsDBIndexType.Key : DocumentsDBIndexType.Key;
		const { dependencies, terminology } = getTerminologies();

		const types = $.derived(() => {
			if (databaseType === 'vectorsdb') {
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
		].includes(selectedType));

		const isObjectType = $.derived(() => selectedType === VectorsDBIndexType.Object);
		const fieldOptions = $.derived(() => (entity.fields ?? []).map((field) => ({ value: field.key, label: field.key })));
		let fieldList = [{ value: '', order: OrderBy.Asc, length: null }];

		const orderOptions = [
			{ value: OrderBy.Asc, label: 'ASC' },
			{ value: OrderBy.Desc, label: 'DESC' }
		];

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
			selectedType = databaseType === 'vectorsdb' ? VectorsDBIndexType.Key : DocumentsDBIndexType.Key;

			fieldList = externalFieldKey
				? [
					{ value: externalFieldKey, order: OrderBy.Asc, length: null }
				]
				: [{ value: '', order: OrderBy.Asc, length: null }];

			key = `index_${entity.indexes.length + 1}`;
		}

		const addFieldDisabled = $.derived(() => isHnswType() || isObjectType() || !fieldList.at(-1)?.value || !isObjectType() && !fieldList.at(-1)?.order);
		const isOnIndexesPage = $.derived(() => page.route.id?.endsWith('/indexes'));

		const navigatorPathToIndexes = $.derived(() => {
			const type = terminology.entity.lower.singular;
			const base = resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params);

			return withPath(base, `${type}-${entity.$id}`, 'indexes');
		});

		// HNSW indexes: auto-fill embeddings, single field only.
		// When switching away to Key/Unique, reset stale `order: null` left over from HNSW.
		async function create() {
			const fieldType = terminology.field.lower.singular;

			if (!key || !selectedType || !isHnswType() && !isObjectType() && addFieldDisabled() || (isHnswType() || isObjectType()) && !fieldList.at(0)?.value) {
				addNotification({
					type: 'error',
					message: `Selected ${fieldType} key or type invalid`
				});

				throw new Error(`Selected ${fieldType} key or type invalid`);
			}

			try {
				await onCreateIndex({
					key,
					type: selectedType,
					fields: fieldList.map((a) => a.value),
					lengths: isHnswType() || isObjectType()
						? []
						: fieldList.map((a) => a.length ? Number(a.length) : null),

					orders: isHnswType() || isObjectType()
						? []
						: fieldList.map((a) => a.order).filter((order) => order !== null)
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

			fieldList = [
				...fieldList,
				{ value: '', order: OrderBy.Asc, length: null }
			];
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
										if (isHnswType()) {
											$$renderer.push('<!--[0-->');

											InputText($$renderer, {
												required: true,
												disabled: true,
												id: `field-${index}`,
												label: index === 0 ? fieldType : undefined,
												get value() {
													return field.value;
												},

												set value($$value) {
													field.value = $$value;
													$$settled = false;
												}
											});
										} else if (fieldOptions().length) {
											$$renderer.push('<!--[1-->');

											InputSelect($$renderer, {
												required: true,
												options: [
													{ value: '$id', label: '$id' },
													{ value: '$createdAt', label: '$createdAt' },
													{ value: '$updatedAt', label: '$updatedAt' },
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
										} else {
											$$renderer.push('<!--[-1-->');

											InputText($$renderer, {
												required: true,
												id: `field-${index}`,
												label: index === 0 ? fieldType : undefined,
												placeholder: `Enter ${$.stringify(fieldType)} name`,
												get value() {
													return field.value;
												},

												set value($$value) {
													field.value = $$value;
													$$settled = false;
												}
											});
										}

										$$renderer.push(`<!--]--> `);

										if (!isHnswType() && !isObjectType()) {
											$$renderer.push('<!--[0-->');

											InputSelect($$renderer, {
												options: orderOptions,
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

											if (selectedType === DocumentsDBIndexType.Key || selectedType === VectorsDBIndexType.Key) {
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

											$$renderer.push(`<!--]-->`);
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
											$$renderer.push(`<!--[-1--><div class="x-button-holder svelte-dxmit2"${$.attr_style('', { 'margin-top': '27.6px' })}>`);

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

						$$renderer.push(`<!--]--> `);

						if (!isHnswType() && !isObjectType()) {
							$$renderer.push(`<!--[0--><div>`);

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
						} else {
							$$renderer.push('<!--[-1-->');
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