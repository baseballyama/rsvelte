import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Sonner_with_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Example($$renderer, {
			title: 'With Description',
			class: 'items-center justify-center',
			children: ($$renderer) => {
				Button($$renderer, {
					onclick: () => toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" }),
					variant: 'outline',
					class: 'w-fit',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show Toast`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}