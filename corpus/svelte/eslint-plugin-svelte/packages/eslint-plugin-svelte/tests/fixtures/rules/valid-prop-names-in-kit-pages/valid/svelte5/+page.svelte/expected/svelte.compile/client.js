import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(` <!> <form method="POST"><textarea></textarea> <button>Post comment</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let comment = '';
	const snapshot = { capture: () => comment, restore: (value) => comment = value };
	var $$exports = { snapshot };

	$.next();

	var fragment = root_1();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `Successfully logged in! Welcome back, ${$$props.data.user.name ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.form?.success) $$render(consequent);
		});
	}

	var form_1 = $.sibling(node, 2);
	var textarea = $.child(form_1);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(form_1);
	$.template_effect(() => $.set_text(text, `${$$props.data ?? ''}, ${errors ?? ''} `));
	$.bind_value(textarea, () => comment, ($$value) => comment = $$value);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}