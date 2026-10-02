import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let array = [{ a: 1, c: 2 }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => array, $.index, ($$anchor, $$item) => {
		let a = () => $.get($$item).a;
		let b = $.derived_safe_equal(() => $.fallback($.get($$item).b, c));
		let c = () => $.get($$item).c;

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, `${a() ?? ''}${$.get(b) ?? ''}${c() ?? ''}`));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}