import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get } from "./main.svelte";

var root = $.from_html(`<p> </p>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const context = get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `caught: ${$$props.error ?? ''} (${context ?? ''})`));
			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, $0), [
				() => (() => {
					throw 'catch me';
				})()
			]);

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($$props.error) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}