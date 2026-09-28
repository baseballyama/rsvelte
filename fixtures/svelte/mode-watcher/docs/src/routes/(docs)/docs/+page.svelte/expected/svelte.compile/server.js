import * as $ from 'svelte/internal/server';
import { DocPage } from "@svecodocs/kit";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		DocPage($$renderer, $.spread_props([{ component: data.component }, data.metadata]));
	});
}