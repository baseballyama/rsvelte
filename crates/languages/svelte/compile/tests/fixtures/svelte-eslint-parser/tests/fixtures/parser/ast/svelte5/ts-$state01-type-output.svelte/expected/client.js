import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Ts_$state01_type_output($$anchor) {
	let count = $.state(0 // count: number, $state(0): 0
	);
	let name = void 0; // name: unknown, $state(): unknown
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.event('click', button, () => $.update(count));
	$.append($$anchor, button);
}