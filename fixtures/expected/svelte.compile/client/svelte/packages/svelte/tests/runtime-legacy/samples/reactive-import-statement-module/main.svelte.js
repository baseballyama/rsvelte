import 'svelte/internal/disclose-version';
import state from './state.js';
import * as $ from 'svelte/internal/client';

function update() {
	state.count += 1;
}

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, state.count));
	$.event('click', button, update);
	$.append($$anchor, button);
	$.pop();
}