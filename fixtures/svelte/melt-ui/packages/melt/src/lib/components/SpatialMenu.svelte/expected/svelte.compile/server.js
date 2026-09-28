import * as $ from 'svelte/internal/server';
import { SpatialMenu as SpatialMenuBuilder } from "../builders/SpatialMenu.svelte";

export default function SpatialMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...rest } = $$props;
		const spatialMenu = new SpatialMenuBuilder(rest);

		children($$renderer, spatialMenu);
		$$renderer.push(`<!---->`);
	});
}