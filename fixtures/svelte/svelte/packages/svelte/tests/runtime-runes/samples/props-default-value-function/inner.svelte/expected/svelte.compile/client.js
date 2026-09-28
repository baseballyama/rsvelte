import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Inner($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var text = $.text();

	$.template_effect(($0) => $.set_text(text, `Inner: ${$0 ?? ''}`), [() => $$props.getter()]);
	$.append($$anchor, text);
	$.pop();
}