import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let tmp = [10, "Admin"],
		$$array = $.derived(() => $.to_array(tmp, 2)),
		level = $.proxy($.get($$array)[0]),
		custom = $.proxy($.get($$array)[1]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${level ?? ''}, ${custom ?? ''}`));
	$.append($$anchor, text);
}