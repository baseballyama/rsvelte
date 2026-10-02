import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { blogConfig } from 'virtual:sveltepress/blog-config';

var root = $.from_html(`<img class="sp-author__avatar svelte-k4dbg4" alt="" width="56" height="56" loading="lazy"/>`);
var root_1 = $.from_html(`<p class="sp-author__bio svelte-k4dbg4"> </p>`);
var root_2 = $.from_html(`<section class="sp-author svelte-k4dbg4" aria-label="About the author"><!> <div class="sp-author__body"><p class="sp-author__name svelte-k4dbg4"> </p> <!></div></section>`);

export default function AuthorCard($$anchor, $$props) {
	$.push($$props, true);

	const author = $.derived(() => blogConfig.author);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var section = root_2();
			var node_1 = $.child(section);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(() => $.set_attribute(img, 'src', $.get(author).avatar));
					$.append($$anchor, img);
				};

				$.if(node_1, ($$render) => {
					if ($.get(author).avatar) $$render(consequent);
				});
			}

			var div = $.sibling(node_1, 2);
			var p = $.child(div);
			var text = $.only_child(p, true);
			var node_2 = $.sibling(p, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p_1 = root_1();
					var text_1 = $.only_child(p_1, true);

					$.template_effect(() => $.set_text(text_1, $.get(author).bio));
					$.append($$anchor, p_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(author).bio) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.reset(section);
			$.template_effect(() => $.set_text(text, $.get(author).name));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(author)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}