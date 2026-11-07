import * as $ from 'svelte/internal/server';
import PivotData from "./PivotData";

export default function TSVExportRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pivotData;
		let rowKeys;
		let colKeys;
		let headerRow;
		let value = "";
		let { $$slots, $$events, ...options } = $$props;

		// style={{ width: window.innerWidth / 2, height: window.innerHeight / 2 }}
		function resize(node) {
			node.style.width = node.parentElement?.clientWidth + "px";
			node.style.height = node.parentElement?.clientHeight + "px";
		}

		$$renderer.push(`<textarea${$.attr('readonly', true, true)}>`);

		const $$body = $.escape(value);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea>`);
	});
}