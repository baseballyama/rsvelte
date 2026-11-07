import * as $ from 'svelte/internal/server';
import { SelectableTag } from "carbon-components-svelte";

export default function SelectableTagReactive($$renderer) {
	let selected = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		SelectableTag($$renderer, {
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(selected ? "Selected" : "Unselected")}`);
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
}