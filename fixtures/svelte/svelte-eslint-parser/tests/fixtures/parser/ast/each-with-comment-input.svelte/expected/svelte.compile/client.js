import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './foo.svelte';

export default function Each_with_comment_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, Array, $.index, (
		$$anchor,
		//comment
		i
	) => {
		Foo($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, i));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}