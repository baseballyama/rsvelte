import * as $ from 'svelte/internal/server';
import { Tags } from "$lib";

export default function InputProps($$renderer) {
	let tags = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Tags($$renderer, {
			inputProps: { id: "my-tags-input" },
			get value() {
				return tags;
			},

			set value($$value) {
				tags = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}