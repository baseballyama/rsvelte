import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TagsInput } from '$lib/components/ui/tags-input';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Tags_input_autocomplete($$anchor) {
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

	let value = $.state($.proxy([]));
	var div = root();
	var node = $.child(div);

	TagsInput(node, {
		placeholder: 'Add a framework',
		get suggestions() {
			return suggestions;
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}