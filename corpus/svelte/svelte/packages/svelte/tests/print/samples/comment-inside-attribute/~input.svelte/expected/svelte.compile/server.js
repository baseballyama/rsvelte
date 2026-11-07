import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Button($$renderer, {
		onclick: () => {
			// belongs to onclick
			run();
		},
		onkeydown: () => run()
	});
}