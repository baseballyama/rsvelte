import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${{
		toString() {
			return "Hello World";
		}
	} ?? ''}

${({ a: '' })['a'] ?? ''}`));

	$.append($$anchor, text);
	$.pop();
}