import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<audio></audio> <button>increment</button>`, 1);

export default function Main($$anchor) {
	let playbackRate = $.state(0.5);
	var fragment = root();
	var audio = $.first_child(fragment);
	var button = $.sibling(audio, 2);

	$.bind_playback_rate(audio, () => $.get(playbackRate), ($$value) => $.set(playbackRate, $$value));
	$.delegated('click', button, () => $.set(playbackRate, $.get(playbackRate) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);