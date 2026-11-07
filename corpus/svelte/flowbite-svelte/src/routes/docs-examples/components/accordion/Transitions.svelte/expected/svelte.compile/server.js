import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion } from "flowbite-svelte";
import { blur, fade } from "svelte/transition";

export default function Transitions($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			{
				function header($$renderer) {
					$$renderer.push(`<!---->Slide duration:1000`);
				}

				AccordionItem($$renderer, {
					transitionParams: { duration: 1000 },
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<!---->Blur duration:300`);
				}

				AccordionItem($$renderer, {
					transitionType: blur,
					transitionParams: { duration: 300 },
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function header($$renderer) {
					$$renderer.push(`<!---->Fade duration:300`);
				}

				AccordionItem($$renderer, {
					transitionType: fade,
					transitionParams: { duration: 300 },
					header,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
					},
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}