import * as $ from 'svelte/internal/server';
import { MenuField, MultiSelectField } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';

export default function TooltipContextControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { settings = void 0, class: className } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cls('grid grid-cols-[1fr_1fr_120px_120px] gap-2 mb-4 screenshot-hidden', className)))}>`);

			MenuField($$renderer, {
				label: 'Mode',
				options: [
					{ label: 'bisect-x', value: 'bisect-x' },
					{ label: 'bisect-y', value: 'bisect-y' },
					{ label: 'bisect-band', value: 'bisect-band' },
					{ label: 'band', value: 'band' },
					{ label: 'bounds', value: 'bounds' },
					{ label: 'voronoi', value: 'voronoi' },
					{ label: 'quadtree', value: 'quadtree' },
					{ label: 'quadtree-x', value: 'quadtree-x' },
					{ label: 'quadtree-y', value: 'quadtree-y' }
				],

				get value() {
					return settings.mode;
				},

				set value($$value) {
					settings.mode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MultiSelectField($$renderer, {
				label: 'Highlight',
				options: [
					{ label: 'points', value: 'points' },
					{ label: 'lines', value: 'lines' },
					{ label: 'area', value: 'area' },
					{ label: 'bar', value: 'bar' }
				],
				formatSelected: ({ options }) => options.map((x) => x.label).join(', '),
				get value() {
					return settings.highlight;
				},

				set value($$value) {
					settings.highlight = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Highlight axis',
				options: [
					{ label: 'default', value: null },
					{ label: 'x', value: 'x' },
					{ label: 'y', value: 'y' },
					{ label: 'both', value: 'both' },
					{ label: 'none', value: 'none' }
				],

				get value() {
					return settings.axis;
				},

				set value($$value) {
					settings.axis = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Snap to Data',
				value: settings.snapToDataX && settings.snapToDataY
					? 'both'
					: settings.snapToDataX ? 'x-only' : settings.snapToDataY ? 'y-only' : 'off',

				options: [
					{ label: 'off', value: 'off' },
					{ label: 'x-only', value: 'x-only' },
					{ label: 'y-only', value: 'y-only' },
					{ label: 'both', value: 'both' }
				]
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { settings });
	});
}