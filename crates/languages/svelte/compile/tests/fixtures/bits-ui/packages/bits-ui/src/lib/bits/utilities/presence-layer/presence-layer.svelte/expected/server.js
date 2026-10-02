import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { Presence } from "./presence.svelte.js";

export default function Presence_layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open, forceMount, presence, ref } = $$props;
		const presenceState = new Presence({ open: boxWith(() => open), ref });

		if (forceMount || open || presenceState.isPresent) {
			$$renderer.push('<!--[0-->');

			presence?.($$renderer, {
				present: presenceState.isPresent,
				transitionStatus: presenceState.transitionStatus
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}