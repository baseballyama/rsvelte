import * as $ from 'svelte/internal/server';
import { SelectableTag } from "carbon-components-svelte";
import IbmCloud from "carbon-icons-svelte/lib/IbmCloud.svelte";

export default function SelectableTagIconReactive($$renderer) {
	let selected = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		SelectableTag($$renderer, {
			icon: IbmCloud,
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->IBM Cloud`);
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