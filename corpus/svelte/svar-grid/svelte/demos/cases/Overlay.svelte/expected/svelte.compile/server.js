import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import Overlay from "../custom/Overlay.svelte";
import { getData } from "../data";

export default function Overlay_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { columns, data } = getData();
		let showOverlay = true;

		function showData({ show }) {
			if (show) showOverlay = false;
		}

		$$renderer.push(`<div style="padding: 20px;"><h4>Overlay as a text</h4> <div>`);

		Grid($$renderer, {
			data: data.slice(0, 5),
			columns,
			overlay: "Loading...",
			footer: true
		});

		$$renderer.push(`<!----></div> <h4>Overlay as a component</h4> <div>`);

		Grid($$renderer, {
			data,
			columns,
			overlay: showOverlay ? Overlay : null,
			footer: true,
			onoverlaybuttonclick: showData
		});

		$$renderer.push(`<!----></div></div>`);
	});
}