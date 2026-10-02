import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	const ping = $.proxy({});

	ping.pong = { ping, pang: 'hello!' };

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, ping.pong.ping.pong.ping.pong.pang));
	$.delegated('click', button, () => ping.pong.pang = 'goodbye!');
	$.append($$anchor, button);
}

$.delegate(['click']);