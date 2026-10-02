import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var text = $.text();

	$.template_effect(($0) => $.set_text(text, $0), [() => $$props.numbers.join(', ')]);
	$.append($$anchor, text);
	$.pop();
}