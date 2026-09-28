import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
import { ChevronDoubleLeft, ChevronDoubleRight } from '$lib/icons';

var root = $.from_html(`<li class="svelte-1it2h8m"><a class="svelte-1it2h8m"> </a></li>`);
var root_1 = $.from_html(`<div class="table-of-contents svelte-1it2h8m"><button aria-label="Hide table of contents" class="svelte-1it2h8m"><!> <h2 class="table-of-contents-title svelte-1it2h8m">Sections</h2></button> <ul class="svelte-1it2h8m"></ul></div>`);
var root_2 = $.from_html(`<button class="sidebar-toggle svelte-1it2h8m" aria-label="Show table of contents"><!></button>`);
var root_3 = $.from_html(`<aside class="svelte-1it2h8m"><section><!></section></aside>`);

export default function Toc($$anchor, $$props) {
	$.push($$props, true);

	const TABLE_OF_CONTENTS = '#table-of-contents + ul';
	let tableOfContents = $.state($.proxy([]));
	let showSidebar = $.state(false);

	onMount(() => {
		const toc = document.querySelector(TABLE_OF_CONTENTS);

		if (!toc) return;

		$.set(
			tableOfContents,
			[...toc.querySelectorAll('a')].map((a, i) => ({
				title: a.textContent,
				href: a.getAttribute('href'),
				active: false
			})),
			true
		);

		if (window.innerWidth >= 1440) {
			const observer = new IntersectionObserver(([entry]) => {
				$.set(showSidebar, entry.boundingClientRect.bottom < 0);
			});

			observer.observe(toc);

			return () => observer.unobserve(toc);
		}
	});

	onMount(() => {
		const headings = document.querySelectorAll('h2');

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					$.get(tableOfContents).forEach((i) => i.active = false);

					const title = entry.target.textContent;
					const index = $.get(tableOfContents).findIndex((i) => i.title === title);

					if (index >= 0) $.get(tableOfContents)[index].active = true;
				}
			},
			{ rootMargin: '0px 0px -90% 0px' }
		);

		headings.forEach((heading) => observer.observe(heading));

		return () => observer.disconnect();
	});

	function toggleSidebar() {
		$.set(showSidebar, !$.get(showSidebar));
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var aside = root_3();
			var section = $.child(aside);
			var node_1 = $.child(section);

			{
				var consequent = ($$anchor) => {
					var div = root_1();
					var button = $.child(div);
					var node_2 = $.child(button);

					ChevronDoubleRight(node_2, { width: 24, height: 24, 'aria-hidden': true });
					$.next(2);
					$.reset(button);

					var ul = $.sibling(button, 2);

					$.each(ul, 21, () => $.get(tableOfContents), $.index, ($$anchor, $$item) => {
						let active = () => $.get($$item).active;
						let title = () => $.get($$item).title;
						let href = () => $.get($$item).href;
						var li = root();
						var a_1 = $.child(li);
						var text = $.only_child(a_1, true);

						$.reset(li);

						$.template_effect(() => {
							$.set_attribute(a_1, 'href', href());
							$.set_attribute(a_1, 'data-active', active());
							$.set_text(text, title());
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div);
					$.delegated('click', button, toggleSidebar);
					$.transition(3, div, () => fly, () => ({ x: '100%', duration: 300 }));
					$.append($$anchor, div);
				};

				var alternate = ($$anchor) => {
					var button_1 = root_2();
					var node_3 = $.child(button_1);

					ChevronDoubleLeft(node_3, { width: 24, height: 24, 'aria-hidden': true });
					$.reset(button_1);
					$.delegated('click', button_1, toggleSidebar);
					$.transition(1, button_1, () => fly, () => ({ x: '100%', duration: 300, delay: 300 }));
					$.append($$anchor, button_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(showSidebar)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(section);
			$.reset(aside);
			$.append($$anchor, aside);
		};

		$.if(node, ($$render) => {
			if ($.get(tableOfContents)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);