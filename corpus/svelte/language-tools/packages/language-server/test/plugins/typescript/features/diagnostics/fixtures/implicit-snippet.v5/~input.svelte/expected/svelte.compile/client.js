import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SnippetParent from "./SnippetParent.svelte";

export default function Input($$anchor) {
	{
		const foo = ($$anchor, a = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, a() === 'b'));
			$.append($$anchor, text);
		};

		SnippetParent($$anchor, {
			foo,
			children: ($$anchor, $$slotProps) => {
				foo($$anchor, () => '');
			},
			$$slots: { foo: true, default: true }
		});
	}
}