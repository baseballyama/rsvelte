import * as $ from 'svelte/internal/server';
import TableRenderers from "./TableRenderers";

export default function PivotTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			renderer: Renderer = TableRenderers.Table,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (Renderer) {
			$$renderer.push('<!--[-->');
			Renderer($$renderer, $.spread_props([restProps]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}