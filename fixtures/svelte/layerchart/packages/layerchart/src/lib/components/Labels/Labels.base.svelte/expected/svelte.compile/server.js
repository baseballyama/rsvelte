import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { LabelsState } from './Labels.shared.svelte.js';
import { getPixelValue } from '../Text/Text.shared.svelte.js';

export default function Labels_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Text,
			Group,
			Points,
			Link,
			data,
			value,
			x,
			y,
			seriesKey,
			placement = 'outside',
			layout,
			occlude,
			links,
			offset = placement === 'center' || placement === 'middle' ? 0 : 4,
			format,
			key = (_, i) => i,
			children: childrenProp,
			class: className,
			fill,
			opacity,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const linkProps = $.derived(() => typeof links === 'object' ? links : {});

		const c = new LabelsState(() => ({
			data,
			value,
			x,
			y,
			seriesKey,
			placement,
			layout,
			occlude,
			links,
			offset,
			format,
			fill,
			opacity,
			fontSize: restProps.fontSize
		}));

		// Make the `fontSize` prop win over the `.lc-labels-text` CSS default (a bare
		// `font-size` attribute would lose to the class rule).
		const fontSizeVar = $.derived(() => restProps.fontSize != null
			? `--labels-font-size: ${getPixelValue(restProps.fontSize)}px`
			: undefined);

		if (Group) {
			$$renderer.push('<!--[-->');

			Group($$renderer, {
				class: 'lc-labels-g',
				opacity: c.derivedOpacity,
				style: fontSizeVar(),
				children: ($$renderer) => {
					{
						function children($$renderer, { points }) {
							if (layout === 'voronoi') {
								$$renderer.push('<!--[0-->');

								const voronoiLabels = c.getVoronoiLabels(points);

								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(points);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let point = each_array[i];
									const item = voronoiLabels[i];

									if (item.visible) {
										$$renderer.push('<!--[0-->');

										const textProps = extractLayerProps(item.textProps, 'lc-labels-text');

										if (childrenProp) {
											$$renderer.push('<!--[0-->');
											childrenProp($$renderer, { data: point, textProps, link: item.link });
											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push('<!--[-1-->');

											if (item.link && Link) {
												$$renderer.push('<!--[0-->');

												if (Link) {
													$$renderer.push('<!--[-->');

													Link($$renderer, $.spread_props([
														{
															x1: item.link.x1,
															y1: item.link.y1,
															x2: item.link.x2,
															y2: item.link.y2,
															type: 'straight'
														},
														linkProps(),
														{
															class: cls('lc-labels-link', typeof linkProps().class === 'string' ? linkProps().class : undefined)
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (Text) {
												$$renderer.push('<!--[-->');

												Text($$renderer, $.spread_props([
													textProps,
													restProps,
													extractLayerProps(item.textProps, 'lc-labels-text', className ?? '')
												]));

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push(`<!--[-1--><!--[-->`);

								const each_array_1 = $.ensure_array_like(points);

								for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
									let point = each_array_1[i];
									const baseProps = c.getTextProps(point, points, i);
									const textProps = extractLayerProps(baseProps, 'lc-labels-text');

									if (childrenProp) {
										$$renderer.push('<!--[0-->');
										childrenProp($$renderer, { data: point, textProps });
										$$renderer.push(`<!---->`);
									} else {
										$$renderer.push('<!--[-1-->');

										if (Text) {
											$$renderer.push('<!--[-->');

											Text($$renderer, $.spread_props([
												{ 'data-placement': placement },
												textProps,
												restProps,
												extractLayerProps(baseProps, 'lc-labels-text', className ?? '')
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
						}

						if (Points) {
							$$renderer.push('<!--[-->');
							Points($$renderer, { data, x, y, seriesKey, children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}