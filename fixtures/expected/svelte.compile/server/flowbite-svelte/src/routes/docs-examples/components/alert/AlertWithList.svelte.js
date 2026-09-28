import * as $ from 'svelte/internal/server';
import { Alert, Li, List } from "flowbite-svelte";
import { InfoCircleSolid } from "flowbite-svelte-icons";

export default function AlertWithList($$renderer) {
	{
		function icon($$renderer) {
			$$renderer.push(`<span>`);
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="sr-only">Info</span></span>`);
		}

		Alert($$renderer, {
			class: 'items-start!',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<p class="font-medium">Ensure that these requirements are met:</p> <ul class="ms-4 mt-1.5 list-inside list-disc"><li>At least 10 characters (and up to 100 characters)</li> <li>At least one lowercase character</li> <li>Inclusion of at least one special character, e.g., ! @ # ?</li></ul>`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			$$renderer.push(`<span>`);
			InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span class="sr-only">Info</span></span>`);
		}

		Alert($$renderer, {
			color: 'blue',
			class: 'items-start!',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<p class="font-medium">Ensure that these requirements are met:</p> `);

				List($$renderer, {
					class: 'ms-4 mt-1.5',
					children: ($$renderer) => {
						Li($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->At least 10 characters (and up to 100 characters)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Li($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->At least one lowercase character`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Li($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Inclusion of at least one special character, e.g., ! @ # ?`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}