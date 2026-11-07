import * as $ from 'svelte/internal/server';
import { IsInViewport } from "runed";
import { DemoContainer } from "@svecodocs/kit";

export default function Is_in_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let targetNode = void 0;
		const inViewport = new IsInViewport(() => targetNode);

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>Target node</p> <p class="text-muted-foreground text-sm italic">Scroll down to observe the behavior</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="bg-background fixed bottom-8 right-8 z-20 flex items-center rounded-lg border p-4 text-sm"><p>Target node is <span class="font-medium text-red-500 data-[in-viewport]:text-green-500"${$.attr('data-in-viewport', inViewport.current ? "" : undefined)}>${$.escape(inViewport.current ? " in " : " out of ")}</span> viewport</p></div>`);
	});
}