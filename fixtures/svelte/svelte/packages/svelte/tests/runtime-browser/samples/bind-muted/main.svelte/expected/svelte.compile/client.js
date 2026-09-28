import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<audio></audio> <button>toggle</button>`, 1);

export default function Main($$anchor) {
	let muted = $.state(false);
	var fragment = root();
	var audio = $.first_child(fragment);
	var button = $.sibling(audio, 2);

	$.bind_muted(audio, () => $.get(muted), ($$value) => $.set(muted, $$value));
	$.delegated('click', button, () => $.set(muted, !$.get(muted)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);