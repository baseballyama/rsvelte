import * as $ from 'svelte/internal/server';
import { useIntersectionObserver } from "runed";
import { Checkbox, Label, DemoContainer } from "@svecodocs/kit";

export default function Use_intersection_observer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let root = null;
		let target = null;
		let isVisible = false;

		const observer = useIntersectionObserver(
			() => target,
			([entry]) => {
				if (entry) {
					isVisible = entry.isIntersecting;
				} else {
					isVisible = false;
				}
			},
			{ root: () => root }
		);

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-4 text-center',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-center">`);

				Checkbox($$renderer, {
					id: 'enabled',
					checked: observer.isActive,
					onCheckedChange: (v) => {
						if (v) {
							observer.resume();
						} else {
							observer.pause();
						}
					}
				});

				$$renderer.push(`<!----> `);

				Label($$renderer, {
					for: 'enabled',
					class: 'pl-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Enable`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="border-border m-2 h-[200px] overflow-y-scroll border-2 border-dashed pt-4"><p class="text-lg italic">Scroll down 👇</p> <div class="border-brand m-6 mt-96 max-h-[150px] border-2 p-2.5"><p>I'm the target! 🎯</p></div></div> <div class="text-center">Element <span${$.attr_class(`font-medium ${isVisible
					? 'text-green-600 dark:text-green-500'
					: 'text-destructive'}`)}>${$.escape(isVisible ? "inside" : "outside")}</span> the viewport</div>`);
			},
			$$slots: { default: true }
		});
	});
}