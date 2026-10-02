import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Condition2_input($$anchor, $$props) {
	$.push($$props, true);

	let newAlbumName = $.state($.proxy($$props.albumName));

	// In practice, this can be converted to $derived, but it’s difficult to detect in all cases.
	// So the rule doesn’t report it for now.
	$.user_effect(() => {
		if ($$props.albumName === '') {
			$.set(newAlbumName, $$props.albumName + $$props.albumName);
		} else {
			$.set(newAlbumName, $$props.albumName, true);
		}
	});

	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => $.get(newAlbumName), ($$value) => $.set(newAlbumName, $$value));
	$.append($$anchor, input);
	$.pop();
}