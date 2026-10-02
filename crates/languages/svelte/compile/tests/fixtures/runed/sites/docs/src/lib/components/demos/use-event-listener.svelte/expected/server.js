import * as $ from 'svelte/internal/server';
import { useEventListener } from "runed";
import { DemoContainer } from "@svecodocs/kit";

export default function Use_event_listener($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		useEventListener(() => document.body, "click", () => count++);

		DemoContainer($$renderer, {
			class: 'select-none',
			children: ($$renderer) => {
				$$renderer.push(`<p>You've clicked the document ${$.escape(count)} ${$.escape(count === 1 ? "time" : "times")}</p>`);
			},
			$$slots: { default: true }
		});
	});
}