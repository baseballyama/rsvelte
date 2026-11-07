import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p> </p> <!>`, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	let exception = $.state(void 0);

	const onerror = (e) => {
		$.set(exception, e, true);
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p);
			var node_1 = $.sibling(p, 2);

			$.boundary(node_1, { onerror }, ($$anchor) => {
				Child($$anchor, {});
			});

			$.template_effect(($0) => $.set_text(text, `condition is ${$0 ?? ''}`), [() => String(!$.get(exception))]);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(exception)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_1, `caught error: ${$.get(exception) ?? ''}`));
			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(exception)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}