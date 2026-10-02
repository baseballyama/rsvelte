import * as $ from 'svelte/internal/server';
import { InputLine } from '$lib/elements/forms';
import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { getDefaultSpatialData } from '../../../store';

export default function Line($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, value = void 0, limited = false, column } = $$props;
		const defaultData = getDefaultSpatialData('linestring');

		function onAddPoint() {
			value = [...value || defaultData, getDefaultSpatialData('point')];
		}

		function onDeletePoint() {
			if (value && value?.length > 2) value = value.slice(0, value.length - 1);
		}

		function handlePointChange(pointIndex, coordIndex, newValue) {
			if (value && value[pointIndex]) {
				value[pointIndex][coordIndex] = newValue;
				value = [...value];
			}
		}

		function handleAddDefault() {
			value = getDefaultSpatialData('linestring');
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
															$$renderer.push(`<!--[-1-->Line`);
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
											$$renderer.push(`<!---->Add Line`);
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

					InputLine($$renderer, {
						values: value,
						nullable: false,
						onAddPoint,
						onDeletePoint,
						onChangePoint: handlePointChange,
						minDeletableIndex: 2
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