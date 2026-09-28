import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	function increment() {
		inc();
	}

	let inc;

	$.effect_root(() => {
		let count = $.state(0);
		let double = $.derived(() => $.get(count) * 2);

		inc = () => {
			$.update(count);
			console.log('count', $.get(count), 'double', $.get(double));
		};
	});

	var $$exports = { increment };

	return $.pop($$exports);
}