import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AreaChartIcon from "@lucide/svelte/icons/area-chart";
import BarChartBigIcon from "@lucide/svelte/icons/bar-chart-big";
import HexagonIcon from "@lucide/svelte/icons/hexagon";
import LineChartIcon from "@lucide/svelte/icons/line-chart";
import MousePointer2Icon from "@lucide/svelte/icons/mouse-pointer-2";
import PieChartIcon from "@lucide/svelte/icons/pie-chart";
import RadarIcon from "@lucide/svelte/icons/radar";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";
import ChartCodeViewer from "./chart-code-viewer.svelte";
import ChartCopyButton from "./chart-copy-button.svelte";

const ChartTitle = ($$anchor, chart = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			LineChartIcon(node_1, {});
			$.next();
			$.append($$anchor, fragment_1);
		};

		var d = $.derived(() => chart().name.includes("chart-line"));

		var consequent_1 = ($$anchor) => {
			var fragment_2 = root_1();
			var node_2 = $.first_child(fragment_2);

			BarChartBigIcon(node_2, {});
			$.next();
			$.append($$anchor, fragment_2);
		};

		var d_1 = $.derived(() => chart().name.includes("chart-bar"));

		var consequent_2 = ($$anchor) => {
			var fragment_3 = root_2();
			var node_3 = $.first_child(fragment_3);

			PieChartIcon(node_3, {});
			$.next();
			$.append($$anchor, fragment_3);
		};

		var d_2 = $.derived(() => chart().name.includes("chart-pie"));

		var consequent_3 = ($$anchor) => {
			var fragment_4 = root_3();
			var node_4 = $.first_child(fragment_4);

			AreaChartIcon(node_4, {});
			$.next();
			$.append($$anchor, fragment_4);
		};

		var d_3 = $.derived(() => chart().name.includes("chart-area"));

		var consequent_4 = ($$anchor) => {
			var fragment_5 = root_4();
			var node_5 = $.first_child(fragment_5);

			HexagonIcon(node_5, {});
			$.next();
			$.append($$anchor, fragment_5);
		};

		var d_4 = $.derived(() => chart().name.includes("chart-radar"));

		var consequent_5 = ($$anchor) => {
			var fragment_6 = root_5();
			var node_6 = $.first_child(fragment_6);

			RadarIcon(node_6, {});
			$.next();
			$.append($$anchor, fragment_6);
		};

		var d_5 = $.derived(() => chart().name.includes("chart-radial"));

		var consequent_6 = ($$anchor) => {
			var fragment_7 = root_6();
			var node_7 = $.first_child(fragment_7);

			MousePointer2Icon(node_7, {});
			$.next();
			$.append($$anchor, fragment_7);
		};

		var d_6 = $.derived(() => chart().name.includes("chart-tooltip"));

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, chart().name));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1); else if ($.get(d_2)) $$render(consequent_2, 2); else if ($.get(d_3)) $$render(consequent_3, 3); else if ($.get(d_4)) $$render(consequent_4, 4); else if ($.get(d_5)) $$render(consequent_5, 5); else if ($.get(d_6)) $$render(consequent_6, 6); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> Line Chart`, 1);
var root_1 = $.from_html(`<!> Bar Chart`, 1);
var root_2 = $.from_html(`<!> Pie Chart`, 1);
var root_3 = $.from_html(`<!> Area Chart`, 1);
var root_4 = $.from_html(`<!> Radar Chart`, 1);
var root_5 = $.from_html(`<!> Radial Chart`, 1);
var root_6 = $.from_html(`<!> Tooltip`, 1);
var root_7 = $.from_html(`<div><div class="flex items-center gap-1.5 ps-1 text-[13px] text-muted-foreground [&amp;>svg]:h-[0.9rem] [&amp;>svg]:w-[0.9rem]"><!></div> <div class="ms-auto flex items-center gap-2 [&amp;>form]:flex"><!> <!> <!></div></div>`);

export default function Chart_toolbar($$anchor, $$props) {
	$.push($$props, true);

	let code = $.state("");

	$.user_effect(() => {
		const file = $$props.chart?.files?.[0];

		if (!file) {
			$.set(code, "");

			return;
		}

		const highlighted = file?.highlightedContent ?? "";
		const pre = document.createElement("pre");

		pre.innerHTML = highlighted;
		$.set(code, pre.textContent ?? "", true);
	});

	var div = root_7();
	var div_1 = $.child(div);
	var node_8 = $.child(div_1);

	ChartTitle(node_8, () => $$props.chart);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_9 = $.child(div_2);

	ChartCopyButton(node_9, {
		get code() {
			return $.get(code);
		},
		class: 'h-6 w-6 rounded-[6px] bg-transparent text-foreground shadow-none hover:bg-muted dark:text-foreground [&_svg]:h-3 [&_svg]:w-3'
	});

	var node_10 = $.sibling(node_9, 2);

	Separator(node_10, { orientation: 'vertical', class: 'mx-0 hidden !h-4 md:flex' });

	var node_11 = $.sibling(node_10, 2);

	ChartCodeViewer(node_11, {
		get chart() {
			return $$props.chart;
		},

		get code() {
			return $.get(code);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_9 = $.comment();
			var node_12 = $.first_child(fragment_9);

			$.snippet(node_12, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("flex items-center gap-2", $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}