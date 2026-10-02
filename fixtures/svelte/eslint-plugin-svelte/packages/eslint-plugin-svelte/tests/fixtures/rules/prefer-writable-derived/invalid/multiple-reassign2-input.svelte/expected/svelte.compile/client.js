import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Multiple_reassign2_input($$anchor, $$props) {
	$.push($$props, true);

	let newAlbumName = $.state($.proxy($$props.albumName));

	$.user_effect(() => {
		$.set(newAlbumName, $$props.albumName, true);
	});

	FooComponent($$anchor, {
		doSomething: (value) => {
			$.set(newAlbumName, value, true);
		}
	});

	$.pop();
}