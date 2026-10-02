import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _3_input($$anchor) {
	$.template_effect(() => {
		console.log({ user: $.snapshot(user) });

		debugger;
	});

	$.template_effect(() => {
		console.log({
			user1: $.snapshot(user1),
			user2: $.snapshot(user2),
			user3: $.snapshot(user3)
		});

		debugger;
	});
}