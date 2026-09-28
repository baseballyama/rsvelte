import 'svelte/internal/disclose-version';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';
import * as $ from 'svelte/internal/client';
import { createConservative } from '$lib/helpers/stores';
import { Selector, Typography, Layout } from '@appwrite.io/pink-svelte';
import { InputPolygon } from '$lib/elements/forms';
import { getDefaultSpatialData, getSingleRingPolygon } from '../store';
import { onMount } from 'svelte';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Polygon($$anchor, $$props) {
	$.push($$props, true);

	const $required = () => $.store_get(required, '$required', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let data = $.prop($$props, 'data', 23, () => ({ default: null, required: false })),
		editing = $.prop($$props, 'editing', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false);

	let savedDefault = $.state($.proxy(data().default));
	let defaultChecked = $.state(!!data().default);

	function handleDefaultState(hideDefault) {
		if (hideDefault) {
			$.set(savedDefault, data().default, true);
			data().default = null;
		} else {
			data().default = $.get(savedDefault) ?? getDefaultSpatialData('polygon');
		}
	}

	const { stores: { required }, listen } = createConservative({ required: false, ...data() });

	function pushCoordinate(ringIndex) {
		const ring = data().default?.at(ringIndex);

		if (!ring) return;

		const newPoint = getDefaultSpatialData('point');

		ring.splice(ring.length - 1, 0, newPoint);
		ring[ring.length - 1] = [...ring[0]];
		data().default = [...data().default || []];
	}

	function pushLine() {
		data().default = [...data().default || [], getSingleRingPolygon()];
	}

	function deleteCoordinate(ringIndex) {
		const ring = data().default?.at(ringIndex);

		ring.splice(ring.length - 1, 1);

		if (ring.length === 0) {
			data().default.splice(ringIndex, 1);
		}

		data().default = [...data().default || []];
	}

	$.user_effect(() => {
		listen(data());
	});

	$.user_effect(() => {
		data().required = $required();

		if ($required()) {
			handleDefaultState(true);
		}
	});

	onMount(() => {
		if (!editing()) {
			$.set(savedDefault, getDefaultSpatialData('polygon'), true);
			$.set(defaultChecked, false);
			$.store_set(required, false);
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
		Selector_Checkbox($$anchor, {
			size: 's',
			id: 'required',
			label: 'Required',
			get disabled() {
				return disabled();
			},
			description: 'Indicate whether this column is required',
			get checked() {
				$.mark_store_binding();

				return $required();
			},

			set checked($$value) {
				$.store_set(required, $$value);
			},

			$$events: {
				change: (e) => {
					if (e.detail) $.set(defaultChecked, false); else data().default = null;
				}
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_1) => {
		Selector_Checkbox_1($$anchor, {
			size: 's',
			id: 'default',
			label: 'Default value',
			get disabled() {
				return disabled();
			},
			description: 'Enable to set a predefined value for this column',
			get checked() {
				return $.get(defaultChecked);
			},

			set checked($$value) {
				$.set(defaultChecked, $$value, true);
			},

			$$events: {
				change: (e) => {
					if (e.detail) {
						$.store_set(required, false);
						handleDefaultState(false);
					} else {
						data().default = null;
					}
				}
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xl',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_5 = $.first_child(fragment_3);

									$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
										Typography_Text($$anchor, {
											variant: 'm-600',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Default');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Typography.Caption, ($$anchor, Typography_Caption) => {
										Typography_Caption($$anchor, {
											variant: '400',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Optional');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_3, ($$render) => {
						if ($.get(defaultChecked)) $$render(consequent);
					});
				}

				var node_7 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => $.get(defaultChecked) ? data().default : null);

					InputPolygon(node_7, {
						get disabled() {
							return disabled();
						},

						get values() {
							return $.get($0);
						},
						onAddLine: pushLine,
						onAddPoint: pushCoordinate,
						onDeletePoint: deleteCoordinate,
						onChangePoint: (lineIndex, pointIndex, coordIndex, newValue) => {
							if (data().default && data().default[lineIndex] && data().default[lineIndex][pointIndex]) {
								data().default[lineIndex][pointIndex][coordIndex] = newValue;
								data().default = [...data().default];
							}
						}
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}