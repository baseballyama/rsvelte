import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<ul class="u-margin-block-start-8"><!></ul>`);
var root_2 = $.from_html(`<div class="u-margin-block-start-8"><!></div>`);
var root_3 = $.from_html(`<ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16 tags"><!></ul>`);
var root_4 = $.from_html(`<div><form><!> <!> <!></form> <!></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const $tags = () => $.store_get(tags, '$tags', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let value = $.prop($$props, 'value', 15, null),
		distanceValue = $.prop($$props, 'distanceValue', 15, null),
		columnId = $.prop($$props, 'columnId', 15, null),
		arrayValues = $.prop($$props, 'arrayValues', 31, () => $.proxy([])),
		operatorKey = $.prop($$props, 'operatorKey', 15, null),
		singleCondition = $.prop($$props, 'singleCondition', 3, false),
		schema = $.prop($$props, 'schema', 3, true);

	// We cast to any to not cause type errors in the input components
	/* eslint  @typescript-eslint/no-explicit-any: 'off' */
	const systemFieldColumns = {
		$id: { id: '$id', title: '$id', type: 'string' },
		$createdAt: { id: '$createdAt', title: '$createdAt', type: 'datetime' },
		$updatedAt: { id: '$updatedAt', title: '$updatedAt', type: 'datetime' }
	};

	const columnsArray = $.derived($columns);
	const isCustomAttribute = $.derived(() => !schema() && columnId() && !systemFieldColumns[columnId()] && !$.get(columnsArray).find((c) => c.id === columnId()));

	const column = $.derived(() => {
		if (!schema() && columnId()) {
			if (systemFieldColumns[columnId()]) {
				return systemFieldColumns[columnId()];
			}

			const existingColumn = $.get(columnsArray).find((c) => c.id === columnId());

			if (!existingColumn) {
				return { id: columnId(), title: columnId(), type: 'string' };
			}

			return existingColumn;
		}

		return $.get(columnsArray).find((c) => c.id === columnId());
	});

	const operatorsForColumn = $.derived(() => {
		if (!schema() && (!$.get(column) || $.get(isCustomAttribute))) {
			return Object.entries(operators).map(([k]) => ({ label: k, value: k }));
		}

		if (!$.get(column)?.type) return [];

		return Object.entries(operators).filter(([, v]) => v.types.includes($.get(column).type)).map(([k]) => ({ label: k, value: k }));
	});

	let operator = $.derived(() => operatorKey() ? operators[operatorKey()] : null);
	let isDisabled = $.derived(() => !$.get(operator));
	let appliedTags = $.derived($tags);
	let columnOptions = $.derived(() => $.get(columnsArray).filter((c) => c.filter !== false).map((c) => ({ label: c.title, value: c.id })));

	let enumOptions = $.derived(() => {
		if (!$.get(column)?.elements) return [];

		return $.get(column).elements.map((e) => ({ label: e?.label ?? e, value: e?.value ?? e }));
	});

	let enumOptionsWithChecked = $.derived(() => {
		if (!$.get(column)?.elements) return [];

		return $.get(column).elements.map((e) => ({
			label: e?.label ?? e,
			value: e?.value ?? e,
			checked: arrayValues().includes(e?.value ?? e)
		}));
	});

	// Check if the current operator is a distance-based operator
	let isDistanceOperator = $.derived(() => operatorKey() && [
		ValidOperators.DistanceEqual,
		ValidOperators.DistanceNotEqual,
		ValidOperators.DistanceGreaterThan,
		ValidOperators.DistanceLessThan
	].includes(operatorKey()));

	onMount(() => {
		value($.get(column)?.array ? [] : null);

		if ($.get(column)?.type === 'datetime') {
			const now = new Date();

			value(toLocalDateTimeISO(now.toISOString()).slice(0, 16));
		}

		// Initialize spatial data with default values
		if ($.get(column)?.type === 'point') {
			value([0, 0]);
		} else if ($.get(column)?.type === 'linestring') {
			value([[0, 0], [1, 1]]);
		} else if ($.get(column)?.type === 'polygon') {
			value([[[0, 0], [1, 1], [2, 2], [0, 0]]]);
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
		const columnsWithVirtual = $.get(column) && !$.get(columnsArray).find((c) => c.id === columnId())
			? [...$.get(columnsArray), $.get(column)]
			: $.get(columnsArray);

		// For distance operators, pass the distance as a separate parameter
		if ($.get(isDistanceOperator) && distanceValue() !== null && value() !== null) {
			addFilter(columnsWithVirtual, columnId(), operatorKey(), value(), arrayValues(), distanceValue());
		} else {
			let preparedValue = value();

			if ($.get(column)?.type === 'datetime' && typeof value() === 'string' && value()) {
				preparedValue = new Date(value()).toISOString();
			} else if (!schema()) {
				const operatorTypes = $.get(operator)?.types || [];

				preparedValue = coerceValueByOperatorType(value(), operatorTypes);
			}

			addFilter(columnsWithVirtual, columnId(), operatorKey(), preparedValue, arrayValues());
		}

		columnId(null);
		operatorKey(null);
		value(null);
		distanceValue(null);
		arrayValues([]);
		dispatch('apply', { applied: $.get(appliedTags).length });

		if (singleCondition()) {
			queries.apply();
		}
	}

	var div = root_4();
	var form = $.child(div);
	var node = $.child(form);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 's',
			direction: 'row',
			alignItems: 'flex-start',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						InputSelect($$anchor, {
							id: 'column',
							get options() {
								return $.get(columnOptions);
							},
							placeholder: 'Select column',
							get value() {
								return columnId();
							},

							set value($$value) {
								columnId($$value);
							}
						});
					};

					var alternate = ($$anchor) => {
						InputText($$anchor, {
							id: 'column',
							placeholder: 'Enter attribute name',
							get value() {
								return columnId();
							},

							set value($$value) {
								columnId($$value);
							}
						});
					};

					$.if(node_1, ($$render) => {
						if (schema()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => !$.get(column) && schema());

					InputSelect(node_2, {
						id: 'operator',
						get disabled() {
							return $.get($0);
						},

						get options() {
							return $.get(operatorsForColumn);
						},
						placeholder: 'Select operator',
						get value() {
							return operatorKey();
						},

						set value($$value) {
							operatorKey($$value);
						}
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	{
		var consequent_9 = ($$anchor) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					{
						var consequent_1 = ($$anchor) => {
							InputSelectCheckbox($$anchor, {
								name: 'value',
								placeholder: 'Select value',
								get options() {
									return $.get(enumOptionsWithChecked);
								},

								get tags() {
									return arrayValues();
								},

								set tags($$value) {
									arrayValues($$value);
								}
							});
						};

						var alternate_1 = ($$anchor) => {
							InputTags($$anchor, {
								label: 'values',
								id: 'value',
								placeholder: 'Enter values',
								get tags() {
									return arrayValues();
								},

								set tags($$value) {
									arrayValues($$value);
								}
							});
						};

						$.if(node_5, ($$render) => {
							if ($.get(column).format === 'enum') $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_4);
				};

				var alternate_3 = ($$anchor) => {
					var ul = root_1();
					var node_6 = $.child(ul);

					{
						var consequent_3 = ($$anchor) => {
							InputSelect($$anchor, {
								id: 'value',
								placeholder: 'Select value',
								get options() {
									return $.get(enumOptions);
								},

								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
								}
							});
						};

						var consequent_4 = ($$anchor) => {
							InputNumber($$anchor, {
								id: 'value',
								placeholder: 'Enter value',
								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
								}
							});
						};

						var consequent_5 = ($$anchor) => {
							InputSelect($$anchor, {
								id: 'value',
								placeholder: 'Select a value',
								required: true,
								options: [
									{ label: 'True', value: true },
									{ label: 'False', value: false }
								],

								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
								}
							});
						};

						var consequent_6 = ($$anchor) => {
							var fragment_10 = $.comment();
							var node_7 = $.first_child(fragment_10);

							$.key(node_7, value, ($$anchor) => {
								InputDateTime($$anchor, {
									id: 'value',
									step: 60,
									type: 'datetime-local',
									get value() {
										return value();
									},

									set value($$value) {
										value($$value);
									}
								});
							});

							$.append($$anchor, fragment_10);
						};

						var consequent_7 = ($$anchor) => {
							{
								let $0 = $.derived(() => value() || [0, 0]);

								InputPoint($$anchor, {
									get values() {
										return $.get($0);
									},

									onChangePoint: (index, newValue) => {
										if (!value()) value([0, 0]);

										value(value()[index] = newValue, true);
									}
								});
							}
						};

						var alternate_2 = ($$anchor) => {
							InputText($$anchor, {
								id: 'value',
								placeholder: 'Enter value',
								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
								}
							});
						};

						$.if(node_6, ($$render) => {
							if ($.get(column)?.format === 'enum') $$render(consequent_3); else if ($.get(column)?.type === 'integer' || $.get(column)?.type === 'double') $$render(consequent_4, 1); else if ($.get(column)?.type === 'boolean') $$render(consequent_5, 2); else if ($.get(column)?.type === 'datetime') $$render(consequent_6, 3); else if ($.get(column)?.type === 'point' || $.get(column)?.type === 'linestring' || $.get(column)?.type === 'polygon') $$render(consequent_7, 4); else $$render(alternate_2, -1);
						});
					}

					$.reset(ul);
					$.append($$anchor, ul);
				};

				$.if(node_4, ($$render) => {
					if ($.get(column)?.array) $$render(consequent_2); else $$render(alternate_3, -1);
				});
			}

			var node_8 = $.sibling(node_4, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_1 = root_2();
					var node_9 = $.child(div_1);

					InputNumber(node_9, {
						id: 'distance',
						placeholder: 'Enter distance',
						step: 0.001,
						required: true,
						get value() {
							return distanceValue();
						},

						set value($$value) {
							distanceValue($$value);
						}
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_8, ($$render) => {
					if ($.get(isDistanceOperator)) $$render(consequent_8);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_3, ($$render) => {
			if (($.get(column) || !schema() && columnId()) && $.get(operator) && !$.get(operator)?.hideInput) $$render(consequent_9);
		});
	}

	var node_10 = $.sibling(node_3, 2);

	{
		var consequent_10 = ($$anchor) => {
			Button($$anchor, {
				text: true,
				get disabled() {
					return $.get(isDisabled);
				},
				class: 'u-margin-block-start-4',
				submit: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add condition');

					$.append($$anchor, text);
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
		};

		$.if(node_10, ($$render) => {
			if (!singleCondition()) $$render(consequent_10);
		});
	}

	$.reset(form);

	var node_11 = $.sibling(form, 2);

	{
		var consequent_11 = ($$anchor) => {
			var ul_1 = root_3();
			var node_12 = $.child(ul_1);

			TagList(node_12, {
				get tags() {
					return $.get(appliedTags);
				},

				$$events: {
					remove: (e) => {
						queries.removeFilter(e.detail);
						queries.apply();
					}
				}
			});

			$.reset(ul_1);
			$.append($$anchor, ul_1);
		};

		$.if(node_11, ($$render) => {
			if (!singleCondition() && $.get(appliedTags).length > 0) $$render(consequent_11);
		});
	}

	$.reset(div);

	$.event('submit', form, (e) => {
		e.preventDefault();
		addFilterAndReset();
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}