import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<audio></audio> <button>increment</button>`, 1);

export default function Main($$anchor) {
	let volume = $.state(0.1);
	var fragment = root();
	var audio = $.first_child(fragment);
	var button = $.sibling(audio, 2);

	$.bind_volume(audio, () => $.get(volume), ($$value) => $.set(volume, $$value));
	$.delegated('click', button, () => $.set(volume, $.get(volume) + 0.1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);