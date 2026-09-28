import * as $ from 'svelte/internal/server';
import { InputPoint } from '$lib/elements/forms';
import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';
import { getDefaultSpatialData } from '../../../store';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';

export default function Point($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, value = void 0, limited = false, column } = $$props;

		function handlePointChange(index, newValue) {
			if (value) {
				value[index] = newValue;
				value = [...value];
			}
		}

		function handleAddDefault() {
			value = getDefaultSpatialData('point');
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
															$$renderer.push(`<!--[-1-->Point`);
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
											$$renderer.push(`<!---->Add Point`);
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

					InputPoint($$renderer, {
						values: value,
						nullable: false,
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