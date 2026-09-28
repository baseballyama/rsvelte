import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2>Hi there!</h2> <p>Your name is: <b> </b> <b><!></b></p> <p>This comes from the URL, matching <code>/hello/:first/:last?</code>, where the last name is optional.</p> <p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/alex</code> or <code>/hello/jane/doe</code></p>`, 1);

export default function Name($$anchor, $$props) {
	$.push($$props, true);

	const params = $.prop($$props, 'params', 19, () => ({}));
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var b = $.sibling($.child(p));
	var text = $.only_child(b, true);
	var b_1 = $.sibling(b, 2);
	var node = $.child(b_1);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, params().last));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (params().last) $$render(consequent);
		});
	}

	$.reset(b_1);
	$.reset(p);
	$.next(4);
	$.template_effect(() => $.set_text(text, params().first));
	$.append($$anchor, fragment);
	$.pop();
}