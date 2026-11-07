import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { blogConfig } from 'virtual:sveltepress/blog-config';

var root = $.from_html(`<div class="sp-siderail svelte-10u7wuu" aria-hidden="true"> </div>`);

export default function SideRail($$anchor, $$props) {
	$.push($$props, true);

	const blogTitle = $.derived(() => blogConfig.title ?? 'Blog');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var text = $.only_child(div);

			$.template_effect(() => $.set_text(text, `Issue · ${$.get(blogTitle) ?? ''} · ${$$props.category ?? ''}`));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.category) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}