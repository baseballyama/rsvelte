import * as $ from 'svelte/internal/server';
import { useResizeObserver } from "runed";
import { Textarea, DemoContainer } from "@svecodocs/kit";

export default function Use_resize_observer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ref = null;
		let text = "";

		useResizeObserver(() => ref, (entries) => {
			const entry = entries[0];

			if (!entry) return;

			const { width, height } = entry.contentRect;

			text = `width: ${width}\nheight: ${height}`;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				children: ($$renderer) => {
					Textarea($$renderer, {
						readonly: true,
						value: text,
						class: 'h-[200px] min-h-[100px] w-[300px]  resize text-base',
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