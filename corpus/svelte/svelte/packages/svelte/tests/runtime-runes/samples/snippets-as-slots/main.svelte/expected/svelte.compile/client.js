import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

export default function Main($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;

			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Default ${foo() ?? ''}`));
			$.append($$anchor, text);
		};

		const named = ($$anchor, $$arg0) => {
			let bar = () => ($$arg0?.()).bar;

			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `Named ${bar() ?? ''}`));
			$.append($$anchor, text_1);
		};

		Child($$anchor, { children, named, $$slots: { default: true, named: true } });
	}
}