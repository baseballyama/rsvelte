import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onMount } from "svelte";
import Grid from "./Grid.svelte";
import { getPrintColumns } from "@svar-ui/grid-store";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'config']);
var root = $.from_html(`<div class="wx-print-grid-wrapper"><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function Print($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const api = getContext("grid-store");
	const { _skin: skin, _columns: columns } = api.getState();
	let grids = getPrintColumns(columns, $$props.config);
	let node = $.state(void 0);

	onMount(() => {
		const target = document.body;

		target.classList.add("wx-print");

		const cloned = $.get(node).cloneNode(true);

		target.appendChild(cloned);

		const rule = `@media print { @page { size: ${$$props.config.paper} ${$$props.config.mode}; }`;
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

	var div = root_1();

	$.each(div, 21, () => grids, $.index, ($$anchor, cols) => {
		var div_1 = root();
		var node_1 = $.child(div_1);

		Grid(node_1, $.spread_props(
			{
				get columns() {
					return $.get(cols);
				}
			},
			() => restProps
		));

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(node, $$value), () => $.get(node));
	$.template_effect(() => $.set_class(div, 1, `wx-${skin ?? ''}-theme wx-print-container`));
	$.append($$anchor, div);
	$.pop();
}