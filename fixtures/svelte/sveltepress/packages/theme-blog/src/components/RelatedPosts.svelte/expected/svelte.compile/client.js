import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<li><a class="sp-related__card svelte-cu8mwp"><span class="sp-related__date svelte-cu8mwp"> </span> <span class="sp-related__heading svelte-cu8mwp"> </span> <span class="sp-related__excerpt svelte-cu8mwp"> </span></a></li>`);
var root_1 = $.from_html(`<section class="sp-related svelte-cu8mwp" aria-label="Related posts"><h2 class="sp-related__title svelte-cu8mwp">Related posts</h2> <ul class="sp-related__grid svelte-cu8mwp"></ul></section>`);

export default function RelatedPosts($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var section = root_1();
			var ul = $.sibling($.child(section), 2);

			$.each(ul, 21, () => $$props.posts, (p) => p.slug, ($$anchor, p) => {
				var li = root();
				var a = $.child(li);
				var span = $.child(a);
				var text = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_1 = $.only_child(span_1, true);
				var span_2 = $.sibling(span_1, 2);
				var text_2 = $.only_child(span_2, true);

				$.reset(a);
				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `${base}/posts/${$.get(p).slug}/`);
					$.set_text(text, $.get(p).date);
					$.set_text(text_1, $.get(p).title);
					$.set_text(text_2, $.get(p).excerpt);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(section);
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($$props.posts.length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}