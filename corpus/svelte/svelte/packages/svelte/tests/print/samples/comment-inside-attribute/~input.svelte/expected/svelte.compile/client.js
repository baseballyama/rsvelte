import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	Button($$anchor, {
		onclick: () => {
			// belongs to onclick
			run();
		},
		onkeydown: () => run()
	});
}