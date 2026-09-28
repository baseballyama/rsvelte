import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	function get_handlers() {
		return {
			handle_click: () => {
				clicked = true;
			}
		};
	}

	let clicked = false;
	const { handle_click } = get_handlers();
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicked: ${clicked ?? ''}`));
	$.event('click', button, handle_click);
	$.append($$anchor, button);
}