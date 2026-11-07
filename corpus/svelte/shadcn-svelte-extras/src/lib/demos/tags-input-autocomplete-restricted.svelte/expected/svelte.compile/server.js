import * as $ from 'svelte/internal/server';
import { TagsInput } from '$lib/components/ui/tags-input';

export default function Tags_input_autocomplete_restricted($$renderer) {
	const suggestions = [
		'Svelte',
		'React',
		'Vue',
		'Angular',
		'Solid',
		'Ember',
		'Next.js',
		'Nuxt'
	];

	let value = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full p-6">`);

		TagsInput($$renderer, {
			placeholder: 'Select a framework',
			suggestions,
			restrictToSuggestions: true,
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