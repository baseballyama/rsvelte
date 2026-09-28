import * as $ from 'svelte/internal/server';
import { createConservative } from '$lib/helpers/stores';
import { Selector, Typography, Layout } from '@appwrite.io/pink-svelte';
import { InputPolygon } from '$lib/elements/forms';
import { getDefaultSpatialData, getSingleRingPolygon } from '../store';
import { onMount } from 'svelte';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

export async function submitPolygon(databaseId, tableId, key, data) {
	await sdk.forProject(page.params.region, page.params.project).tablesDB.createPolygonColumn({
		databaseId,
		tableId,
		key,
		required: data.required,
		xdefault: data?.default
	});
}

export async function updatePolygon(databaseId, tableId, data, originalKey) {
	await sdk.forProject(page.params.region, page.params.project).tablesDB.updatePolygonColumn({
		databaseId,
		tableId,
		key: originalKey,
		required: data.required,
		xdefault: data?.default,
		newKey: data.key !== originalKey ? data.key : undefined
	});
}

export default function Polygon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			data = { default: null, required: false },
			editing = false,
			disabled = false
		} = $$props;

		let savedDefault = data.default;
		let defaultChecked = !!data.default;

		function handleDefaultState(hideDefault) {
			if (hideDefault) {
				savedDefault = data.default;
				data.default = null;
			} else {
				data.default = savedDefault ?? getDefaultSpatialData('polygon');
			}
		}

		const { stores: { required }, listen } = createConservative({ required: false, ...data });

		function pushCoordinate(ringIndex) {
			const ring = data.default?.at(ringIndex);

			if (!ring) return;

			const newPoint = getDefaultSpatialData('point');

			ring.splice(ring.length - 1, 0, newPoint);
			ring[ring.length - 1] = [...ring[0]];
			data.default = [...data.default || []];
		}

		function pushLine() {
			data.default = [...data.default || [], getSingleRingPolygon()];
		}

		function deleteCoordinate(ringIndex) {
			const ring = data.default?.at(ringIndex);

			ring.splice(ring.length - 1, 1);

			if (ring.length === 0) {
				data.default.splice(ringIndex, 1);
			}

			data.default = [...data.default || []];
		}

		onMount(() => {
			if (!editing) {
				savedDefault = getDefaultSpatialData('polygon');
				defaultChecked = false;
				$.store_set(required, false);
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Selector.Checkbox) {
				$$renderer.push('<!--[-->');

				Selector.Checkbox($$renderer, {
					size: 's',
					id: 'required',
					label: 'Required',
					disabled,
					description: 'Indicate whether this column is required',
					get checked() {
						return $.store_get($$store_subs ??= {}, '$required', required);
					},

					set checked($$value) {
						$.store_set(required, $$value);
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Selector.Checkbox) {
				$$renderer.push('<!--[-->');

				Selector.Checkbox($$renderer, {
					size: 's',
					id: 'default',
					label: 'Default value',
					disabled,
					description: 'Enable to set a predefined value for this column',
					get checked() {
						return defaultChecked;
					},

					set checked($$value) {
						defaultChecked = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 'xl',
					children: ($$renderer) => {
						if (defaultChecked) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									alignItems: 'center',
									children: ($$renderer) => {
										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												variant: 'm-600',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Default`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Typography.Caption) {
											$$renderer.push('<!--[-->');

											Typography.Caption($$renderer, {
												variant: '400',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Optional`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						InputPolygon($$renderer, {
							disabled,
							values: defaultChecked ? data.default : null,
							onAddLine: pushLine,
							onAddPoint: pushCoordinate,
							onDeletePoint: deleteCoordinate,
							onChangePoint: (lineIndex, pointIndex, coordIndex, newValue) => {
								if (data.default && data.default[lineIndex] && data.default[lineIndex][pointIndex]) {
									data.default[lineIndex][pointIndex][coordIndex] = newValue;
									data.default = [...data.default];
								}
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}