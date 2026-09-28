import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div> </div> <!>`, 1);
var root_1 = $.from_html(`<div>content before</div> <!> <div>content after</div>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	$.boundary(node, { onerror: (e) => console.log('error caught 2') }, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			const failed = ($$anchor, err = $.noop, reset = $.noop) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var text = $.only_child(div);
				var node_2 = $.sibling(div, 2);

				Child(node_2, { initial: 2 });
				$.template_effect(() => $.set_text(text, `An error occurred! ${err() ?? ''}`));
				$.append($$anchor, fragment_2);
			};

			$.boundary(node_1, { onerror: (e) => console.log('error caught 1'), failed }, ($$anchor) => {
				Child($$anchor, {});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.next(2);
	$.append($$anchor, fragment);
}