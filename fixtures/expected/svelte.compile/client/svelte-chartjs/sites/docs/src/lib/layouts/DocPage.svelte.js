import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { base } from '$app/paths';
import TableOfContents from '$lib/components/TableOfContents.svelte';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<div class="doc-layout svelte-1wur4sp"><article class="svelte-1wur4sp"><!> <footer class="edit-link svelte-1wur4sp"><a target="_blank" rel="noopener noreferrer" class="svelte-1wur4sp">Edit this page on GitHub</a></footer></article> <!></div>`);

export default function DocPage($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		description = $.prop($$props, 'description', 3, '');

	let articleEl = $.state(null);

	const editUrl = $.derived(() => () => {
		const pathname = page.url.pathname.replace(base, '') || '/';

		return `https://github.com/SauravKanchan/svelte-chartjs/edit/master/sites/docs/src/routes${pathname}/+page.md`;
	});

	var div = root_1();

	$.head('1wur4sp', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.template_effect(() => $.set_attribute(meta, 'content', description()));
				$.append($$anchor, meta);
			};

			$.if(node, ($$render) => {
				if (description()) $$render(consequent);
			});
		}

		$.deferred_template_effect(() => {
			$.document.title = title() ? `${title()} | svelte-chartjs` : 'svelte-chartjs';
		});

		$.append($$anchor, fragment);
	});

	var article = $.child(div);
	var node_1 = $.child(article);

	$.snippet(node_1, () => $$props.children);

	var footer = $.sibling(node_1, 2);
	var a = $.only_child(footer);

	$.reset(article);
	$.bind_this(article, ($$value) => $.set(articleEl, $$value), () => $.get(articleEl));

	var node_2 = $.sibling(article, 2);

	{
		var consequent_1 = ($$anchor) => {
			TableOfContents($$anchor, {
				get article() {
					return $.get(articleEl);
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(articleEl)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => $.get(editUrl)()]);
	$.append($$anchor, div);
	$.pop();
}