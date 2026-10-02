import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let count = 0;

	function* test() {
		while (true) {
			yield count++;
		}
	}

	let tmp = test(),
		$$array = $.derived(() => $.to_array(tmp, 2)),
		one = $.proxy($.get($$array)[0]),
		two = $.proxy($.get($$array)[1]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${one ?? ''}, ${two ?? ''}`));
	$.append($$anchor, text);
}