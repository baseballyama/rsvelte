import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DocPage } from "@svecodocs/kit";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	DocPage($$anchor, $.spread_props(
		{
			get component() {
				return $$props.data.component;
			}
		},
		() => $$props.data.metadata
	));

	$.pop();
}