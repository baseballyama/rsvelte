import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TagsInput } from '$lib/components/ui/tags-input';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Tags_input($$anchor) {
	let value = $.state($.proxy(['Svelte', 'jsrepo']));
	var div = root();
	var node = $.child(div);

	TagsInput(node, {
		placeholder: 'Add a tag',
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