import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<audio></audio> <button></button>`, 1);

export default function Main($$anchor) {
	let muted = $.state(false);

	function volume_change(node) {
		node.addEventListener("volumechange", () => {
			console.log(node.muted);
		});
	}

	var fragment = root();
	var audio = $.first_child(fragment);

	$.action(audio, ($$node) => volume_change?.($$node));

	var button = $.sibling(audio, 2);

	$.template_effect(() => audio.muted = $.get(muted));
	$.delegated('click', button, () => $.set(muted, !$.get(muted)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);