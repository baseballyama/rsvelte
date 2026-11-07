import * as $ from 'svelte/internal/server';
import { Button, Icon, MenuButton, Tooltip } from 'svelte-ux';
import LucideFocus from '~icons/lucide/focus';
import LucideChevronDown from '~icons/lucide/chevron-down';
import LucideCircleOff from '~icons/lucide/circle-off';
import LucideImageUpscale from '~icons/lucide/image-upscale';
import LucideMove from '~icons/lucide/move';
import LucideUndo2 from '~icons/lucide/undo-2';
import LucideZoomIn from '~icons/lucide/zoom-in';
import LucideZoomOut from '~icons/lucide/zoom-out';
import { getChartContext } from 'layerchart';

export default function TransformContextControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placement = 'top-right',
			orientation = 'vertical',
			size = 'md',
			show = ['zoomIn', 'zoomOut', 'center', 'reset', 'scrollMode'],
			class: className
		} = $$props;

		const menuPlacementByOrientationAndPlacement = $.derived(() => ({
			horizontal: {
				'top-left': 'bottom-end',
				top: 'bottom-end',
				'top-right': 'bottom-end',
				left: 'bottom-end',
				center: 'bottom-end',
				right: 'bottom-end',
				'bottom-left': 'top-end',
				bottom: 'top-end',
				'bottom-right': 'top-end'
			},
			vertical: {
				'top-left': 'right-start',
				top: 'right-start',
				'top-right': 'left-start',
				left: 'right-start',
				center: 'right-start',
				right: 'left-start',
				'bottom-left': 'right-end',
				bottom: 'right-end',
				'bottom-right': 'left-end'
			}
		}));

		const chart = getChartContext();

		$$renderer.push(`<div${$.attr_class($.clsx(['lc-transform-controls screenshot-hidden', className]), 'svelte-1i98pia')}${$.attr('data-orientation', orientation)}${$.attr('data-placement', placement)}>`);

		if (// Stop from propagating to TransformContext
		show.includes('zoomIn')) {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				title: 'Zoom in',
				children: ($$renderer) => {
					Button($$renderer, { icon: LucideZoomIn, size, class: 'text-surface-content p-2' });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (show.includes('zoomOut')) {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				title: 'Zoom out',
				children: ($$renderer) => {
					Button($$renderer, { icon: LucideZoomOut, size, class: 'text-surface-content p-2' });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (show.includes('center')) {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				title: 'Center',
				children: ($$renderer) => {
					Button($$renderer, { icon: LucideFocus, size, class: 'text-surface-content p-2' });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (show.includes('reset')) {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				title: 'Reset',
				children: ($$renderer) => {
					Button($$renderer, { icon: LucideUndo2, size, class: 'text-surface-content p-2' });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (show.includes('scrollMode')) {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				title: 'Scroll mode',
				children: ($$renderer) => {
					MenuButton($$renderer, {
						iconOnly: true,
						options: [
							{ label: 'None', value: 'none', icon: LucideCircleOff },
							{ label: 'Zoom', value: 'scale', icon: LucideImageUpscale },
							{ label: 'Move', value: 'translate', icon: LucideMove }
						],
						menuProps: {
							placement: menuPlacementByOrientationAndPlacement()[orientation][placement]
						},
						menuIcon: null,
						size,
						value: chart.transform.scrollMode,
						class: 'text-surface-content',
						$$slots: {
							selection: ($$renderer, { value }) => {
								{
									$$renderer.push(`<!---->`);

									{
										Icon($$renderer, { data: value?.icon ?? LucideChevronDown });
									}

									$$renderer.push(`<!---->`);
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}