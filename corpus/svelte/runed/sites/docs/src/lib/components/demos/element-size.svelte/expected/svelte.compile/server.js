import * as $ from 'svelte/internal/server';
import { ElementSize } from "runed";
import { DemoContainer, Textarea } from "@svecodocs/kit";

export default function Element_size($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ref = null;
		const size = new ElementSize(() => ref);
		const text = $.derived(() => `Width: ${size.width}\nHeight: ${size.height}`);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				children: ($$renderer) => {
					Textarea($$renderer, {
						class: 'h-[200px] min-h-[100px] w-[300px] resize text-base',
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