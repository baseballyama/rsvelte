import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="inline-error svelte-1fg5vg"> </p>`);

export default function InlineError($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $$props.displayError));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.displayError) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}