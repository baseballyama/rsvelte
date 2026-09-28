import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { setMode } from "mode-watcher";
import { resolve } from "$app/paths";
import LatencyTrendChart from "$lib/components/LatencyTrendChart.svelte";
import { Skeleton } from "$lib/components/ui/skeleton/index.js";
import { t } from "$lib/stores/i18n";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		// State
		let loading = true;

		let overviewData = null;
		let error = null;

		// Display values from API response
		let displayUptime = $.derived(() => overviewData?.uptime ?? "--");

		let displayData = $.derived(() => overviewData?.uptimeData ?? []);

		const metricToKeyMap = {
			average: "avgLatency",
			maximum: "maxLatency",
			minimum: "minLatency"
		};

		let displayLatency = $.derived(() => overviewData?.[metricToKeyMap[data.metric]] ?? "--");

		// Transform data for chart component
		let latencyChartData = $.derived(() => displayData().map((d) => ({
			date: new Date(d.ts * 1000),
			value: d[metricToKeyMap[data.metric]] || 0
		})));

		async function fetchData() {
			loading = true;
			error = null;

			try {
				const url = `?tag=${data.monitorTag}&endOfDayTodayAtTz=${data.endOfDayTodayAtTz}&days=${data.days}`;
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-bar") + url);

				if (!response.ok) {
					throw new Error("Monitor not found");
				}

				overviewData = await response.json();
			} catch(e) {
				console.error("Failed to fetch monitor data:", e);
				error = e instanceof Error ? e.message : "Failed to load data";
			} finally {
				loading = false;
			}
		}

		onMount(() => {
			if (data.theme) {
				setMode(data.theme === "dark" ? "dark" : "light");
			}

			fetchData();
		});

		$$renderer.push(`<div class="flex flex-col gap-2 p-2">`);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="flex items-center justify-between">`);
			Skeleton($$renderer, { class: 'h-4 w-20' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-24' });
			$$renderer.push(`<!----></div> `);

			Skeleton($$renderer, {
				class: 'w-full rounded',
				style: `height: ${$.stringify(data.height)}px;`
			});

			$$renderer.push(`<!---->`);
		} else if (error) {
			$$renderer.push(`<!--[1--><div class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Failed to load data"))}</div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="flex items-center justify-between text-xs font-semibold"><span class="text-foreground">${$.escape(displayUptime())}% ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Uptime"))}</span> `);

			if (!!displayLatency() && displayLatency() !== "--") {
				$$renderer.push(`<!--[0--><span>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("%latency %metric latency", {
					latency: String(displayLatency()),
					metric: $.store_get($$store_subs ??= {}, '$t', t)(data.metric)
				}))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);
			LatencyTrendChart($$renderer, { data: latencyChartData(), height: data.height });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}