import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<li><a> </a></li>`);
var root_1 = $.from_html(`<nav class="toc svelte-1240kco" aria-label="Table of contents"><h4 class="toc-title svelte-1240kco">On this page</h4> <ul class="svelte-1240kco"></ul></nav>`);

export default function TableOfContents($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ article: HTMLElement }} */
	let headings = $.state($.proxy([]));

	let activeId = $.state('');

	onMount(() => {
		if (!$$props.article) return;

		const nodes = $$props.article.querySelectorAll('h2[id], h3[id]');

		$.set(
			headings,
			Array.from(nodes).map((el) => ({
				id: el.id,
				text: el.textContent ?? '',
				level: el.tagName === 'H3' ? 3 : 2
			})),
			true
		);

		if ($.get(headings).length < 2) {
			$.set(headings, [], true);

			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						$.set(activeId, entry.target.id, true);
					}
				}
			},
			{ rootMargin: '-80px 0px -60% 0px' }
		);

		for (const node of nodes) {
			observer.observe(node);
		}

		return () => observer.disconnect();
	});

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var nav = root_1();
			var ul = $.sibling($.child(nav), 2);

			$.each(ul, 21, () => $.get(headings), $.index, ($$anchor, heading) => {
				var li = root();
				let classes;
				var a = $.child(li);
				let classes_1;
				var text = $.only_child(a, true);

				$.reset(li);

				$.template_effect(() => {
					classes = $.set_class(li, 1, 'svelte-1240kco', null, classes, { indent: $.get(heading).level === 3 });
					$.set_attribute(a, 'href', `#${$.get(heading).id ?? ''}`);
					classes_1 = $.set_class(a, 1, 'svelte-1240kco', null, classes_1, { active: $.get(activeId) === $.get(heading).id });
					$.set_text(text, $.get(heading).text);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node_1, ($$render) => {
			if ($.get(headings).length >= 2) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}