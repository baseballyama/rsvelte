import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import ChartStyle from './chart-style.svelte';
import { setChartContext } from './chart-utils.js';

export default function Chart_container($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = uid,
			class: className,
			children,
			config,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const chartId = $.derived(() => `chart-${id || uid.replace(/:/g, '')}`);

		setChartContext({
			get config() {
				return config;
			}
		});

		$$renderer.push(`<div${$.attributes({
			'data-chart': chartId(),
			'data-slot': 'chart',
			class: $.clsx(cn(
				'flex aspect-video justify-center overflow-visible text-xs',
				// Overrides
				//
				// Stroke around dots/marks when hovering
				'[&_.lc-highlight-point]:stroke-transparent',
				// override the default stroke color of lines
				'[&_.lc-line]:stroke-border/50',
				// by default, layerchart shows a line intersecting the point when hovering, this hides that
				'[&_.lc-highlight-line]:stroke-0',
				// by default, when you hover a point on a stacked series chart, it will drop the opacity
				// of the other series, this overrides that
				'[&_.lc-area-path]:opacity-100 [&_.lc-highlight-line]:opacity-100 [&_.lc-highlight-point]:opacity-100 [&_.lc-spline-path]:opacity-100 [&_.lc-text]:text-xs [&_.lc-text-svg]:overflow-visible',
				// We don't want the little tick lines between the axis labels and the chart, so we remove
				// the stroke. The alternative is to manually disable `tickMarks` on the x/y axis of every
				// chart.
				'[&_.lc-axis-tick]:stroke-0',
				// We don't want to display the rule on the x/y axis, as there is already going to be
				// a grid line there and rule ends up overlapping the marks because it is rendered after
				// the marks
				'[&_.lc-rule-x-line:not(.lc-grid-x-rule)]:stroke-0 [&_.lc-rule-y-line:not(.lc-grid-y-rule)]:stroke-0',
				'[&_.lc-grid-x-radial-line]:stroke-border [&_.lc-grid-x-radial-circle]:stroke-border',
				'[&_.lc-grid-y-radial-line]:stroke-border [&_.lc-grid-y-radial-circle]:stroke-border',
				// Legend adjustments
				'[&_.lc-legend-swatch-button]:items-center [&_.lc-legend-swatch-button]:gap-1.5',
				'[&_.lc-legend-swatch-group]:items-center [&_.lc-legend-swatch-group]:gap-4',
				'[&_.lc-legend-swatch]:size-2.5 [&_.lc-legend-swatch]:rounded-[2px]',
				// Labels
				'[&_.lc-labels-text:not([fill])]:fill-foreground [&_text]:stroke-transparent',
				// Tick labels on th x/y axes
				'[&_.lc-axis-tick-label]:fill-muted-foreground [&_.lc-axis-tick-label]:font-normal',
				'[&_.lc-tooltip-rects-g]:fill-transparent',
				'[&_.lc-layout-svg-g]:fill-transparent',
				'[&_.lc-root-container]:w-full',
				className
			)),
			...restProps
		})}>`);

		ChartStyle($$renderer, { id: chartId(), config });
		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}