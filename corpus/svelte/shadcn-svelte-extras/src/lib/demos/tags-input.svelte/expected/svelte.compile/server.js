import * as $ from 'svelte/internal/server';
import { TagsInput } from '$lib/components/ui/tags-input';

export default function Tags_input($$renderer) {
	let value = ['Svelte', 'jsrepo'];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full p-6">`);

		TagsInput($$renderer, {
			placeholder: 'Add a tag',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}