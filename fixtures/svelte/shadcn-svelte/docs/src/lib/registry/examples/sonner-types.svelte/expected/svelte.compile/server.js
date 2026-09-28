import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Sonner_types($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="flex flex-wrap gap-2">`);

		Button($$renderer, {
			variant: 'outline',
			onclick: () => toast("Event has been created"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Default`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'outline',
			onclick: () => toast.success("Event has been created"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Success`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'outline',
			onclick: () => toast.info("Be at the area 10 minutes before the event time"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Info`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'outline',
			onclick: () => toast.warning("Event start time cannot be earlier than 8am"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Warning`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'outline',
			onclick: () => toast.error("Event has not been created"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Error`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			variant: 'outline',
			onclick: () => {
				toast.promise(() => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)), {
					loading: "Loading...",
					success: (data) => `${data.name} has been created`,
					error: "Error"
				});
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Promise`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}