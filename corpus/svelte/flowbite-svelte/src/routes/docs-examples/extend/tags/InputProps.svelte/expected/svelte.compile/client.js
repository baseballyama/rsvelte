import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tags } from "$lib";

export default function InputProps($$anchor) {
	let tags = $.state($.proxy([]));

	Tags($$anchor, {
		inputProps: { id: "my-tags-input" },
		get value() {
			return $.get(tags);
		},

		set value($$value) {
			$.set(tags, $$value, true);
		}
	});
}