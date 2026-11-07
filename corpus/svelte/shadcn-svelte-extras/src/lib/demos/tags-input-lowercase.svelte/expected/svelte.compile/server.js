import * as $ from 'svelte/internal/server';
import { TagsInput } from '$lib/components/ui/tags-input';

export default function Tags_input_lowercase($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const customValidate = (val, tags) => {
			// trim and convert to lowercase
			const transformed = val.trim().toLowerCase();

			// disallow empties
			if (transformed.length === 0) return undefined;

			// disallow duplicates
			if (tags.find((t) => transformed === t.toLowerCase())) return undefined;

			return transformed;
		};

		let value = ['svelte', 'jsrepo'];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="w-full p-6">`);

			TagsInput($$renderer, {
				placeholder: 'Add a tag',
				validate: customValidate,
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
	});
}