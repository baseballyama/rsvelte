import * as $ from 'svelte/internal/server';
import { breakpointObserver, breakpoints } from "carbon-components-svelte";

export default function BreakpointObserver($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const size = breakpointObserver();
		const smaller = size.smallerThan("md");
		const larger = size.largerThan("md");

		$$renderer.push(`<p>Current breakpoint size: ${$.escape($.store_get($$store_subs ??= {}, '$size', size))}</p> <p>Current breakpoint value: ${$.escape(breakpoints[$.store_get($$store_subs ??= {}, '$size', size)])}px</p> <p>Smaller than medium: ${$.escape($.store_get($$store_subs ??= {}, '$smaller', smaller))}</p> <p>Larger than medium: ${$.escape($.store_get($$store_subs ??= {}, '$larger', larger))}</p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}