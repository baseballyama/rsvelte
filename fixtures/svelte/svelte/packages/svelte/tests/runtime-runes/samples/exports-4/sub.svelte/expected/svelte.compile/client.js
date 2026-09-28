import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Sub($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let doubled = $.derived(() => $.get(count) * 2);

	var $$exports = {
		get count() {
			return $.get(count);
		},

		set count($$value) {
			$.set(count, $.proxy($$value));
		},

		get doubled() {
			return $.get(doubled);
		}
	};

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''}
${$.get(doubled) ?? ''}`));

	$.append($$anchor, text);

	return $.pop($$exports);
}