import * as $ from 'svelte/internal/server';
import { ElementRect } from "runed";
import { DemoContainer, Textarea } from "@svecodocs/kit";

export default function Element_rect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ref = null;
		const rect = new ElementRect(() => ref);
		const text = $.derived(() => Object.entries(rect.current).map(([key, value]) => `${key}: ${value}`).join("\n"));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				children: ($$renderer) => {
					Textarea($$renderer, {
						class: 'h-[330px] min-h-[300px] w-[300px] resize text-base',
						value: text(),
						readonly: true,
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}