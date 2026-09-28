import 'svelte/internal/disclose-version';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { Layout } from '@appwrite.io/pink-svelte';
import { InputNumber } from '$lib/elements/forms';
import { createConservative } from '$lib/helpers/stores';
import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';

function normalizeBigInt(value, field) {
	if (value === undefined) return undefined;
	if (value === null) return null;

	if (typeof value === 'number') {
		if (!Number.isFinite(value) || Number.isNaN(value)) {
			throw new Error(`${field} must be a finite integer`);
		}

		if (!Number.isInteger(value)) {
			throw new Error(`${field} must be an integer`);
		}
	}

	try {
		return BigInt(value);
	} catch {
		throw new Error(`${field} must be a valid integer`);
	}
}

export async function submitBigInt(databaseId, tableId, key, data) {
	const bigintData = data;

	await sdk.forProject(page.params.region, page.params.project).tablesDB.createBigIntColumn({
		databaseId,
		tableId,
		key,
		required: bigintData.required,
		min: normalizeBigInt(bigintData.min, 'Min'),
		max: normalizeBigInt(bigintData.max, 'Max'),
		xdefault: normalizeBigInt(bigintData.default, 'Default value'),
		array: bigintData.array
	});
}

export async function updateBigInt(databaseId, tableId, data, originalKey) {
	const bigintData = data;

	await sdk.forProject(page.params.region, page.params.project).tablesDB.updateBigIntColumn({
		databaseId,
		tableId,
		key: originalKey,
		required: bigintData.required,
		xdefault: normalizeBigInt(bigintData.default, 'Default value'),
		min: normalizeBigInt(bigintData.min, 'Min'),
		max: normalizeBigInt(bigintData.max, 'Max'),
		newKey: bigintData.key !== originalKey ? bigintData.key : undefined
	});
}

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Bigint($$anchor, $$props) {
	$.push($$props, true);

	const $required = () => $.store_get(required, '$required', $$stores);
	const $array = () => $.store_get(array, '$array', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let editing = $.prop($$props, 'editing', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		data = $.prop($$props, 'data', 31, () => $.proxy({ required: false, min: 0, max: 0, default: 0, array: false }));

	let savedDefault = data().default;

	function handleDefaultState(hideDefault) {
		if (hideDefault) {
			savedDefault = data().default;
			data(data().default = null, true);
		} else {
			data(data().default = savedDefault, true);
		}
	}

	const { stores: { required, array }, listen } = createConservative({ required: false, array: false, ...data() });

	$.user_effect(() => {
		listen(data());
	});

	// untrack: handleDefaultState reads and writes data.default, which would make
	// this effect depend on the state it writes and trigger an infinite update loop.
	$.user_effect(() => {
		const hideDefault = $required() || $array();

		untrack(() => handleDefaultState(hideDefault));
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			direction: 'row',
			gap: 's',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				InputNumber(node_1, {
					id: 'min',
					label: 'Min',
					get disabled() {
						return disabled();
					},
					placeholder: 'Enter size',
					step: 1,
					get required() {
						return editing();
					},

					get value() {
						return data().min;
					},

					set value($$value) {
						data(data().min = $$value, true);
					}
				});

				var node_2 = $.sibling(node_1, 2);

				InputNumber(node_2, {
					id: 'max',
					label: 'Max',
					get disabled() {
						return disabled();
					},
					placeholder: 'Enter size',
					step: 1,
					get required() {
						return editing();
					},

					get value() {
						return data().max;
					},

					set value($$value) {
						data(data().max = $$value, true);
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => data().required || data().array || disabled());
		let $1 = $.derived(() => !data().required && !data().array || disabled());

		InputNumber(node_3, {
			id: 'default',
			label: 'Default value',
			placeholder: 'Enter value',
			step: 1,
			get min() {
				return data().min;
			},

			get max() {
				return data().max;
			},

			get disabled() {
				return $.get($0);
			},

			get nullable() {
				return $.get($1);
			},

			get value() {
				return data().default;
			},

			set value($$value) {
				data(data().default = $$value, true);
			}
		});
	}

	var node_4 = $.sibling(node_3, 2);

	RequiredArrayCheckboxes(node_4, {
		get editing() {
			return editing();
		},

		get disabled() {
			return disabled();
		},

		get array() {
			return data().array;
		},

		set array($$value) {
			data(data().array = $$value, true);
		},

		get required() {
			return data().required;
		},

		set required($$value) {
			data(data().required = $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}