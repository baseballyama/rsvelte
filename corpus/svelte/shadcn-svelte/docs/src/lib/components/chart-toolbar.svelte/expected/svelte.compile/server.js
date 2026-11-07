import * as $ from 'svelte/internal/server';
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

function ChartTitle($$renderer, chart) {
	if (chart.name.includes("chart-line")) {
		$$renderer.push('<!--[0-->');
		LineChartIcon($$renderer, {});
		$$renderer.push(`<!----> Line Chart`);
	} else if (chart.name.includes("chart-bar")) {
		$$renderer.push('<!--[1-->');
		BarChartBigIcon($$renderer, {});
		$$renderer.push(`<!----> Bar Chart`);
	} else if (chart.name.includes("chart-pie")) {
		$$renderer.push('<!--[2-->');
		PieChartIcon($$renderer, {});
		$$renderer.push(`<!----> Pie Chart`);
	} else if (chart.name.includes("chart-area")) {
		$$renderer.push('<!--[3-->');
		AreaChartIcon($$renderer, {});
		$$renderer.push(`<!----> Area Chart`);
	} else if (chart.name.includes("chart-radar")) {
		$$renderer.push('<!--[4-->');
		HexagonIcon($$renderer, {});
		$$renderer.push(`<!----> Radar Chart`);
	} else if (chart.name.includes("chart-radial")) {
		$$renderer.push('<!--[5-->');
		RadarIcon($$renderer, {});
		$$renderer.push(`<!----> Radial Chart`);
	} else if (chart.name.includes("chart-tooltip")) {
		$$renderer.push('<!--[6-->');
		MousePointer2Icon($$renderer, {});
		$$renderer.push(`<!----> Tooltip`);
	} else {
		$$renderer.push(`<!--[-1-->${$.escape(chart.name)}`);
	}

	$$renderer.push(`<!--]-->`);
}

export default function Chart_toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chart, class: className, children } = $$props;
		let code = "";

		$$renderer.push(`<div${$.attr_class($.clsx(cn("flex items-center gap-2", className)))}><div class="flex items-center gap-1.5 ps-1 text-[13px] text-muted-foreground [&amp;>svg]:h-[0.9rem] [&amp;>svg]:w-[0.9rem]">`);
		ChartTitle($$renderer, chart);
		$$renderer.push(`<!----></div> <div class="ms-auto flex items-center gap-2 [&amp;>form]:flex">`);

		ChartCopyButton($$renderer, {
			code,
			class: 'h-6 w-6 rounded-[6px] bg-transparent text-foreground shadow-none hover:bg-muted dark:text-foreground [&_svg]:h-3 [&_svg]:w-3'
		});

		$$renderer.push(`<!----> `);
		Separator($$renderer, { orientation: 'vertical', class: 'mx-0 hidden !h-4 md:flex' });
		$$renderer.push(`<!----> `);

		ChartCodeViewer($$renderer, {
			chart,
			code,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}