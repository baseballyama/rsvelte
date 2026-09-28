import * as $ from 'svelte/internal/server';
import { getContext, onMount } from "svelte";
import Grid from "./Grid.svelte";
import { getPrintColumns } from "@svar-ui/grid-store";

export default function Print($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { config, $$slots, $$events, ...restProps } = $$props;
		const api = getContext("grid-store");
		const { _skin: skin, _columns: columns } = api.getState();
		let grids = getPrintColumns(columns, config);
		let node = void 0;

		onMount(() => {
			const target = document.body;

			target.classList.add("wx-print");

			const cloned = node.cloneNode(true);

			target.appendChild(cloned);

			const rule = `@media print { @page { size: ${config.paper} ${config.mode}; }`;
			const style = document.createElement("style");

			style.setAttribute("type", "text/css");
			style.setAttribute("media", "print");
			document.getElementsByTagName("head")[0].appendChild(style);
			style.appendChild(document.createTextNode(rule));
			window.print();
			style.remove();
			target.classList.remove("wx-print");
			cloned.remove();
		});

		$$renderer.push(`<div${$.attr_class(`wx-${$.stringify(skin)}-theme wx-print-container`)}><!--[-->`);

		const each_array = $.ensure_array_like(grids);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let cols = each_array[$$index];

			$$renderer.push(`<div class="wx-print-grid-wrapper">`);
			Grid($$renderer, $.spread_props([{ columns: cols }, restProps]));
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}