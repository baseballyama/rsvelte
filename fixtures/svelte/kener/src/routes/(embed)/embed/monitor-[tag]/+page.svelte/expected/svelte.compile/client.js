import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { setMode } from "mode-watcher";
import { resolve } from "$app/paths";
import StatusBarCalendar from "$lib/components/StatusBarCalendar.svelte";
import { Skeleton } from "$lib/components/ui/skeleton/index.js";
import { t } from "$lib/stores/i18n";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<div class="flex items-center justify-between"><!> <!></div> <!>`, 1);
var root_1 = $.from_html(`<div class="text-muted-foreground text-xs"> </div>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between text-xs font-semibold"><span class="text-foreground"> </span> <!></div> <!>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-2 p-2"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// State
	let loading = $.state(true);

	let overviewData = $.state(null);
	let error = $.state(null);
	const localTz = $.derived(() => $$props.data.localTz || "UTC");

	// Display values from API response
	let displayUptime = $.derived(() => $.get(overviewData)?.uptime ?? "--");

	let displayAvgLatency = $.derived(() => $.get(overviewData)?.avgLatency ?? "--");
	let displayData = $.derived(() => $.get(overviewData)?.uptimeData ?? []);

	async function fetchData() {
		$.set(loading, true);
		$.set(error, null);

		try {
			const url = `?tag=${$$props.data.monitorTag}&endOfDayTodayAtTz=${$$props.data.endOfDayTodayAtTz}&days=${$$props.data.days}`;
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-bar") + url);

			if (!response.ok) {
				throw new Error("Monitor not found");
			}

			$.set(overviewData, await response.json(), true);
		} catch(e) {
			console.error("Failed to fetch monitor data:", e);
			$.set(error, e instanceof Error ? e.message : "Failed to load data", true);
		} finally {
			$.set(loading, false);
		}
	}

	onMount(() => {
		if ($$props.data.theme) {
			setMode($$props.data.theme === "dark" ? "dark" : "light");
		}

		fetchData();
	});

	var div = root_4();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var div_1 = $.first_child(fragment);
			var node_1 = $.child(div_1);

			Skeleton(node_1, { class: 'h-4 w-20' });

			var node_2 = $.sibling(node_1, 2);

			Skeleton(node_2, { class: 'h-4 w-24' });
			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			Skeleton(node_3, { class: 'h-7.5 w-full rounded' });
			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var text = $.only_child(div_2, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => $t()("Failed to load data")]);
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var div_3 = $.first_child(fragment_1);
			var span = $.child(div_3);
			var text_1 = $.only_child(span);
			var node_4 = $.sibling(span, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_1 = root_2();
					var text_2 = $.only_child(span_1);

					$.template_effect(($0) => $.set_text(text_2, `${$.get(displayAvgLatency) ?? ''} ${$0 ?? ''}`), [() => $t()("Avg Latency")]);
					$.append($$anchor, span_1);
				};

				$.if(node_4, ($$render) => {
					if ($.get(displayAvgLatency) !== "--") $$render(consequent_2);
				});
			}

			$.reset(div_3);

			var node_5 = $.sibling(div_3, 2);

			StatusBarCalendar(node_5, {
				get data() {
					return $.get(displayData);
				},

				get monitorTag() {
					return $$props.data.monitorTag;
				},
				barHeight: 30,
				radius: 4,
				disableClick: true
			});

			$.template_effect(($0) => $.set_text(text_1, `${$.get(displayUptime) ?? ''}% ${$0 ?? ''}`), [() => $t()("Uptime")]);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}