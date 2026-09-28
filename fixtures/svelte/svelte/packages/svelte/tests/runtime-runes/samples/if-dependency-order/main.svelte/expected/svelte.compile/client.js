import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy({ num: 1 }));

	function expire() {
		$.get(data).num = $.get(data).num - 1;

		if ($.get(data).num <= 0) $.set(data, undefined);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var button = $.first_child(fragment_1);
			var p = $.sibling(button, 2);
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `expires in ${$.get(data).num ?? ''} click`));
			$.delegated('click', button, expire);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(data)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);