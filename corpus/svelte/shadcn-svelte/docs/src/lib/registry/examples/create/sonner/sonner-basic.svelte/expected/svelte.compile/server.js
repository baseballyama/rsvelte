import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Sonner_basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Example($$renderer, {
			title: 'Basic',
			class: 'items-center justify-center',
			children: ($$renderer) => {
				Button($$renderer, {
					onclick: () => toast("Event has been created"),
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