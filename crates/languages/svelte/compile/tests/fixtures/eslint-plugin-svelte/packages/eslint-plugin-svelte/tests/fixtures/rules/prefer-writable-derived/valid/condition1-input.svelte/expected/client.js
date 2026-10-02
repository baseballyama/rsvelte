import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Condition1_input($$anchor, $$props) {
	$.push($$props, true);

	let newAlbumName = $.state($.proxy($$props.albumName));

	$.user_effect(() => {
		if ($$props.albumName === '') {
			return;
		}

		$.set(newAlbumName, $$props.albumName, true);
	});

	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => $.get(newAlbumName), ($$value) => $.set(newAlbumName, $$value));
	$.append($$anchor, input);
	$.pop();
}