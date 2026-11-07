import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let current = { active: false };
	let count = 0;

	function toggle() {
		if (current.active = !current.active) {
			count += 1;
		}
	}

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${current.active ?? ''} ${count ?? ''}`));
	$.event('click', button, toggle);
	$.append($$anchor, button);
}