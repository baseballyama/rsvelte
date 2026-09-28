import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import Heading from '$lib/ui/heading.svelte';
import Posts from '$lib/ui/posts.svelte';
import * as config from '$lib/site/config';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<div class="container svelte-j39hja"><div><span class="tag svelte-j39hja"> </span></div> <div><span class="results svelte-j39hja"> </span> results</div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const posts = $.derived(() => $$props.data.posts);
	const category = $page().params.category;
	var fragment = root_2();

	$.head('j39hja', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `${config.categories[category] ?? ''} category.`));

		$.deferred_template_effect(() => {
			$.document.title = config.categories[category] ?? '';
		});

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	Heading(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, config.categories[category]));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const title = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var span = $.child(div_1);
			var text_1 = $.only_child(span, true);

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var span_1 = $.child(div_2);
			var text_2 = $.only_child(span_1, true);

			$.next();
			$.reset(div_2);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text_1, category);
				$.set_text(text_2, $.get(posts).length);
			});

			$.append($$anchor, div);
		};

		Posts(node_1, {
			get posts() {
				return $.get(posts);
			},
			title,
			$$slots: { title: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}