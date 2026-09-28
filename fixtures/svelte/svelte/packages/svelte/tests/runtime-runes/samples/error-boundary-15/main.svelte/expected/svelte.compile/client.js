import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('test');
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: (e) => console.log('error caught 2') }, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			const failed = ($$anchor) => {
				$.next();

				var text = $.text();

				$.template_effect(($0) => $.set_text(text, $0), [() => throw_error()]);
				$.append($$anchor, text);
			};

			$.boundary(node_1, { onerror: (e) => console.log('error caught 1'), failed }, ($$anchor) => {
				Child($$anchor, {});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}