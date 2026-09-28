import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="theme-color"/>`);

export default function Mode_watcher_lite($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var meta = root();

			$.template_effect(() => $.set_attribute(meta, 'content', $$props.themeColors.dark));
			$.append($$anchor, meta);
		};

		$.if(node, ($$render) => {
			if ($$props.themeColors) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}