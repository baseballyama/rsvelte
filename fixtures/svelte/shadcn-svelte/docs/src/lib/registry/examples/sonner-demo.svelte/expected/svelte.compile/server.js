import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Sonner_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Button($$renderer, {
			variant: 'outline',
			onclick: () => toast("Event has been created", {
				description: "Sunday, December 03, 2023 at 9:00 AM",
				action: { label: "Undo", onClick: () => console.info("Undo") }
			}),

			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Toast`);
			},
			$$slots: { default: true }
		});
	});
}