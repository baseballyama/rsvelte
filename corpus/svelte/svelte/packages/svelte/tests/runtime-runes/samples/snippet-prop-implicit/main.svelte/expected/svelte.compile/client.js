import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	{
		const foo = ($$anchor, n = $.noop) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `clicks: ${n() ?? ''}`));
			$.append($$anchor, p);
		};

		Counter($$anchor, { foo, $$slots: { foo: true } });
	}
}