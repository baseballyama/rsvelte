import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
import { getDefaultSpatialData, getSingleRingPolygon } from '../../../store';
import InputPolygon from '$lib/elements/forms/inputPolygon.svelte';

export default function Polygon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, value = void 0, limited = false, column } = $$props;

		function pushCoordinate(ringIndex) {
			const ring = value[ringIndex];

			if (!ring) return;

			const newPoint = getDefaultSpatialData('point');
			const newRing = [...ring];

			newRing.splice(newRing.length - 1, 0, newPoint);
			newRing[newRing.length - 1] = [...newRing[0]];
			value = value.map((r, i) => i === ringIndex ? newRing : r);
		}

		function pushLine() {
			if (!value) return;

			value = [...value, getSingleRingPolygon()];
		}

		function deleteCoordinate(ringIndex) {
			if (!value) return;

			value = value.map((ring, i) => i === ringIndex ? ring.slice(0, -1) : ring).filter((ring) => ring.length > 0);
		}

		function handlePointChange(lineIndex, pointIndex, coordIndex, newValue) {
			if (value && value[lineIndex] && value[lineIndex][pointIndex]) {
				value[lineIndex][pointIndex][coordIndex] = newValue;
				value = [...value];
			}
		}

		function handleAddDefault() {
			value = getDefaultSpatialData('polygon');
		}

		const nullable = $.derived(() => !limited ? !column.required : false);

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										alignItems: 'center',
										gap: 's',
										children: ($$renderer) => {
											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													variant: 'm-500',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(label)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													variant: 'm-400',
													color: '--fgcolor-neutral-tertiary',
													children: ($$renderer) => {
														if (nullable()) {
															$$renderer.push(`<!--[0-->optional`);
														} else {
															$$renderer.push(`<!--[-1-->Polygon`);
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
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (!value) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										secondary: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add Polygon`);
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

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					InputPolygon($$renderer, {
						values: value,
						nullable: false,
						onAddLine: pushLine,
						onAddPoint: pushCoordinate,
						onDeletePoint: deleteCoordinate,
						onChangePoint: handlePointChange
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

		$.bind_props($$props, { value });
	});
}