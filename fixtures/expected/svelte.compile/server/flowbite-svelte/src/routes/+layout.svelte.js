import * as $ from 'svelte/internal/server';
import "../app.css";
import FathomAnalytics from "./utils/FathomAnalytics.svelte";
import CarbonAds from "./utils/CarbonAds.svelte";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, data } = $$props;

		FathomAnalytics($$renderer, { FATHOM_ID: data.FATHOM_ID });
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!----> `);
		CarbonAds($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}