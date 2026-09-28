import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TagsInput } from '$lib/components/ui/tags-input';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Tags_input_lowercase($$anchor, $$props) {
	$.push($$props, true);

	const customValidate = (val, tags) => {
		// trim and convert to lowercase
		const transformed = val.trim().toLowerCase();

		// disallow empties
		if (transformed.length === 0) return undefined;

		// disallow duplicates
		if (tags.find((t) => transformed === t.toLowerCase())) return undefined;

		return transformed;
	};

	let value = $.state($.proxy(['svelte', 'jsrepo']));
	var div = root();
	var node = $.child(div);

	TagsInput(node, {
		placeholder: 'Add a tag',
		validate: customValidate,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}