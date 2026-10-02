import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import ChartStyle from "./chart-style.svelte";
import { setChartContext } from "./chart-utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'class',
	'children',
	'config'
]);

var root = $.from_html(`<div><!> <!></div>`);

export default function Chart_container($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 3, uid),
		restProps = $.rest_props($$props, rest_excludes);

	const chartId = `chart-${id() || uid.replace(/:/g, "")}`;

	setChartContext({
		get config() {
			return $$props.config;
		}
	});

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-chart': chartId,
			'data-slot': 'chart',
			class: $0,
			...// Overrides
			//
			// Stroke around dots/marks when hovering
			// override the default stroke color of lines
			// by default, layerchart shows a line intersecting the point when hovering, this hides that
			// by default, when you hover a point on a stacked series chart, it will drop the opacity
			// of the other series, this overrides that
			// We don't want the little tick lines between the axis labels and the chart, so we remove
			// the stroke. The alternative is to manually disable `tickMarks` on the x/y axis of every
			// chart.
			// We don't want to display the rule on the x/y axis, as there is already going to be
			// a grid line there and rule ends up overlapping the marks because it is rendered after
			// the marks
			// Legend adjustments
			// Labels
			// Tick labels on th x/y axes
			restProps
		}),
		[
			() => cn("flex aspect-video justify-center overflow-visible text-xs", "[&_.stroke-white]:stroke-transparent", "[&_.lc-line]:stroke-border/50", "[&_.lc-highlight-line]:stroke-0", "[&_.lc-area-path]:opacity-100 [&_.lc-highlight-line]:opacity-100 [&_.lc-highlight-point]:opacity-100 [&_.lc-spline-path]:opacity-100 [&_.lc-text-svg]:overflow-visible [&_.lc-text]:text-xs", "[&_.lc-axis-tick]:stroke-0", "[&_.lc-rule-x-line:not(.lc-grid-x-rule)]:stroke-0 [&_.lc-rule-y-line:not(.lc-grid-y-rule)]:stroke-0", "[&_.lc-grid-x-radial-line]:stroke-border [&_.lc-grid-x-radial-circle]:stroke-border", "[&_.lc-grid-y-radial-line]:stroke-border [&_.lc-grid-y-radial-circle]:stroke-border", "[&_.lc-legend-swatch-button]:items-center [&_.lc-legend-swatch-button]:gap-1.5", "[&_.lc-legend-swatch-group]:items-center [&_.lc-legend-swatch-group]:gap-4", "[&_.lc-legend-swatch]:size-2.5 [&_.lc-legend-swatch]:rounded-[2px]", "[&_.lc-labels-text:not([fill])]:fill-foreground [&_text]:stroke-transparent", "[&_.lc-axis-tick-label]:fill-muted-foreground [&_.lc-axis-tick-label]:font-normal", "[&_.lc-tooltip-rects-g]:fill-transparent", "[&_.lc-layout-svg-g]:fill-transparent", "[&_.lc-root-container]:w-full", $$props.class)
		]
	);

	var node = $.child(div);

	ChartStyle(node, {
		get id() {
			return chartId;
		},

		get config() {
			return $$props.config;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}