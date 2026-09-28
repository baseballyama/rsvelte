import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>cleanup</button>`);

export default function Main($$anchor) {
	$.effect_root(() => {
		console.log('effect1');
	});

	const cleanup = $.effect_root(() => {
		console.log('effect2');
	});

	var button = root();

	$.delegated('click', button, cleanup);
	$.append($$anchor, button);
}

$.delegate(['click']);