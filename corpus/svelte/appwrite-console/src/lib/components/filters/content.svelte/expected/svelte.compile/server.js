import * as $ from 'svelte/internal/server';

import {
	Button,
	InputNumber,
	InputSelect,
	InputText,
	InputTags,
	InputSelectCheckbox,
	InputDateTime,
	InputPoint
} from '$lib/elements/forms';

import { onMount, createEventDispatcher } from 'svelte';
import { operators, addFilter, queries, tags, ValidOperators } from './store';
import { TagList } from '.';
import { toLocalDateTimeISO } from '$lib/helpers/date';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			value = null,
			distanceValue = null,
			columns,
			columnId = null,
			arrayValues = [],
			operatorKey = null,
			singleCondition = false,
			schema = true

			// We cast to any to not cause type errors in the input components
			/* eslint  @typescript-eslint/no-explicit-any: 'off' */
		} = $$props;

		const systemFieldColumns = {
			$id: { id: '$id', title: '$id', type: 'string' },
			$createdAt: { id: '$createdAt', title: '$createdAt', type: 'datetime' },
			$updatedAt: { id: '$updatedAt', title: '$updatedAt', type: 'datetime' }
		};

		const columnsArray = $.derived(() => $.store_get($$store_subs ??= {}, '$columns', columns));
		const isCustomAttribute = $.derived(() => !schema && columnId && !systemFieldColumns[columnId] && !columnsArray().find((c) => c.id === columnId));

		const column = $.derived(() => {
			if (!schema && columnId) {
				if (systemFieldColumns[columnId]) {
					return systemFieldColumns[columnId];
				}

				const existingColumn = columnsArray().find((c) => c.id === columnId);

				if (!existingColumn) {
					return { id: columnId, title: columnId, type: 'string' };
				}

				return existingColumn;
			}

			return columnsArray().find((c) => c.id === columnId);
		});

		const operatorsForColumn = $.derived(() => {
			if (!schema && (!column() || isCustomAttribute())) {
				return Object.entries(operators).map(([k]) => ({ label: k, value: k }));
			}

			if (!column()?.type) return [];

			return Object.entries(operators).filter(([, v]) => v.types.includes(column().type)).map(([k]) => ({ label: k, value: k }));
		});

		let operator = $.derived(() => operatorKey ? operators[operatorKey] : null);
		let isDisabled = $.derived(() => !operator());
		let appliedTags = $.derived(() => $.store_get($$store_subs ??= {}, '$tags', tags));
		let columnOptions = $.derived(() => columnsArray().filter((c) => c.filter !== false).map((c) => ({ label: c.title, value: c.id })));

		let enumOptions = $.derived(() => {
			if (!column()?.elements) return [];

			return column().elements.map((e) => ({ label: e?.label ?? e, value: e?.value ?? e }));
		});

		let enumOptionsWithChecked = $.derived(() => {
			if (!column()?.elements) return [];

			return column().elements.map((e) => ({
				label: e?.label ?? e,
				value: e?.value ?? e,
				checked: arrayValues.includes(e?.value ?? e)
			}));
		});

		// Check if the current operator is a distance-based operator
		let isDistanceOperator = $.derived(() => operatorKey && [
			ValidOperators.DistanceEqual,
			ValidOperators.DistanceNotEqual,
			ValidOperators.DistanceGreaterThan,
			ValidOperators.DistanceLessThan
		].includes(operatorKey));

		onMount(() => {
			value = column()?.array ? [] : null;

			if (column()?.type === 'datetime') {
				const now = new Date();

				value = toLocalDateTimeISO(now.toISOString()).slice(0, 16);
			}

			// Initialize spatial data with default values
			if (column()?.type === 'point') {
				value = [0, 0];
			} else if (column()?.type === 'linestring') {
				value = [[0, 0], [1, 1]];
			} else if (column()?.type === 'polygon') {
				value = [[[0, 0], [1, 1], [2, 2], [0, 0]]];
			}
		});

		const dispatch = createEventDispatcher();

		function coerceValueByOperatorType(value, operatorTypes) {
			if (typeof value !== 'string' || !value) return value;

			if (operatorTypes.includes('integer') || operatorTypes.includes('double')) {
				const numValue = Number(value);

				if (!isNaN(numValue) && value.trim() !== '') {
					return numValue;
				}
			} else if (operatorTypes.includes('boolean')) {
				const lowerValue = value.toLowerCase().trim();

				if (lowerValue === 'true' || lowerValue === '1') {
					return true;
				} else if (lowerValue === 'false' || lowerValue === '0') {
					return false;
				}
			}

			return value;
		}

		function addFilterAndReset() {
			const columnsWithVirtual = column() && !columnsArray().find((c) => c.id === columnId) ? [...columnsArray(), column()] : columnsArray();

			// For distance operators, pass the distance as a separate parameter
			if (isDistanceOperator() && distanceValue !== null && value !== null) {
				addFilter(columnsWithVirtual, columnId, operatorKey, value, arrayValues, distanceValue);
			} else {
				let preparedValue = value;

				if (column()?.type === 'datetime' && typeof value === 'string' && value) {
					preparedValue = new Date(value).toISOString();
				} else if (!schema) {
					const operatorTypes = operator()?.types || [];

					preparedValue = coerceValueByOperatorType(value, operatorTypes);
				}

				addFilter(columnsWithVirtual, columnId, operatorKey, preparedValue, arrayValues);
			}

			columnId = null;
			operatorKey = null;
			value = null;
			distanceValue = null;
			arrayValues = [];
			dispatch('apply', { applied: appliedTags().length });

			if (singleCondition) {
				queries.apply();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div><form>`);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					direction: 'row',
					alignItems: 'flex-start',
					children: ($$renderer) => {
						if (schema) {
							$$renderer.push('<!--[0-->');

							InputSelect($$renderer, {
								id: 'column',
								options: columnOptions(),
								placeholder: 'Select column',
								get value() {
									return columnId;
								},

								set value($$value) {
									columnId = $$value;
									$$settled = false;
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');

							InputText($$renderer, {
								id: 'column',
								placeholder: 'Enter attribute name',
								get value() {
									return columnId;
								},

								set value($$value) {
									columnId = $$value;
									$$settled = false;
								}
							});
						}

						$$renderer.push(`<!--]--> `);

						InputSelect($$renderer, {
							id: 'operator',
							disabled: !column() && schema,
							options: operatorsForColumn(),
							placeholder: 'Select operator',
							get value() {
								return operatorKey;
							},

							set value($$value) {
								operatorKey = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if ((column() || !schema && columnId) && operator() && !operator()?.hideInput) {
				$$renderer.push('<!--[0-->');

				if (column()?.array) {
					$$renderer.push('<!--[0-->');

					if (column().format === 'enum') {
						$$renderer.push('<!--[0-->');

						InputSelectCheckbox($$renderer, {
							name: 'value',
							placeholder: 'Select value',
							options: enumOptionsWithChecked(),
							get tags() {
								return arrayValues;
							},

							set tags($$value) {
								arrayValues = $$value;
								$$settled = false;
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						InputTags($$renderer, {
							label: 'values',
							id: 'value',
							placeholder: 'Enter values',
							get tags() {
								return arrayValues;
							},

							set tags($$value) {
								arrayValues = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><ul class="u-margin-block-start-8">`);

					if (column()?.format === 'enum') {
						$$renderer.push('<!--[0-->');

						InputSelect($$renderer, {
							id: 'value',
							placeholder: 'Select value',
							options: enumOptions(),
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						});
					} else if (column()?.type === 'integer' || column()?.type === 'double') {
						$$renderer.push('<!--[1-->');

						InputNumber($$renderer, {
							id: 'value',
							placeholder: 'Enter value',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						});
					} else if (column()?.type === 'boolean') {
						$$renderer.push('<!--[2-->');

						InputSelect($$renderer, {
							id: 'value',
							placeholder: 'Select a value',
							required: true,
							options: [
								{ label: 'True', value: true },
								{ label: 'False', value: false }
							],

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						});
					} else if (column()?.type === 'datetime') {
						$$renderer.push(`<!--[3--><!---->`);

						{
							InputDateTime($$renderer, {
								id: 'value',
								step: 60,
								type: 'datetime-local',
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});
						}

						$$renderer.push(`<!---->`);
					} else if (column()?.type === 'point' || column()?.type === 'linestring' || column()?.type === 'polygon') {
						$$renderer.push('<!--[4-->');

						InputPoint($$renderer, {
							values: value || [0, 0],
							onChangePoint: (index, newValue) => {
								if (!value) value = [0, 0];

								value[index] = newValue;
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						InputText($$renderer, {
							id: 'value',
							placeholder: 'Enter value',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]--></ul>`);
				}

				$$renderer.push(`<!--]--> `);

				if (isDistanceOperator()) {
					$$renderer.push(`<!--[0--><div class="u-margin-block-start-8">`);

					InputNumber($$renderer, {
						id: 'distance',
						placeholder: 'Enter distance',
						step: 0.001,
						required: true,
						get value() {
							return distanceValue;
						},

						set value($$value) {
							distanceValue = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!singleCondition) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					text: true,
					disabled: isDisabled(),
					class: 'u-margin-block-start-4',
					submit: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add condition`);
					},

					$$slots: {
						default: true,
						start: ($$renderer) => {
							Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></form> `);

			if (!singleCondition && appliedTags().length > 0) {
				$$renderer.push(`<!--[0--><ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16 tags">`);
				TagList($$renderer, { tags: appliedTags() });
				$$renderer.push(`<!----></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { value, distanceValue, columnId, arrayValues, operatorKey });
	});
}