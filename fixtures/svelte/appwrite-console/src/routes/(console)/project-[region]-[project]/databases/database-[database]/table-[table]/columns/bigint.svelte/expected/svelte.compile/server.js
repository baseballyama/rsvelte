import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { Layout } from '@appwrite.io/pink-svelte';
import { InputNumber } from '$lib/elements/forms';
import { createConservative } from '$lib/helpers/stores';
import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';

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

export default function Bigint($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			editing = false,
			disabled = false,
			data = { required: false, min: 0, max: 0, default: 0, array: false }
		} = $$props;

		let savedDefault = data.default;

		function handleDefaultState(hideDefault) {
			if (hideDefault) {
				savedDefault = data.default;
				data.default = null;
			} else {
				data.default = savedDefault;
			}
		}

		const { stores: { required, array }, listen } = createConservative({ required: false, array: false, ...data });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					direction: 'row',
					gap: 's',
					children: ($$renderer) => {
						InputNumber($$renderer, {
							id: 'min',
							label: 'Min',
							disabled,
							placeholder: 'Enter size',
							step: 1,
							required: editing,
							get value() {
								return data.min;
							},

							set value($$value) {
								data.min = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						InputNumber($$renderer, {
							id: 'max',
							label: 'Max',
							disabled,
							placeholder: 'Enter size',
							step: 1,
							required: editing,
							get value() {
								return data.max;
							},

							set value($$value) {
								data.max = $$value;
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

			InputNumber($$renderer, {
				id: 'default',
				label: 'Default value',
				placeholder: 'Enter value',
				step: 1,
				min: data.min,
				max: data.max,
				disabled: data.required || data.array || disabled,
				nullable: !data.required && !data.array || disabled,
				get value() {
					return data.default;
				},

				set value($$value) {
					data.default = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RequiredArrayCheckboxes($$renderer, {
				editing,
				disabled,
				get array() {
					return data.array;
				},

				set array($$value) {
					data.array = $$value;
					$$settled = false;
				},

				get required() {
					return data.required;
				},

				set required($$value) {
					data.required = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { data });
	});
}