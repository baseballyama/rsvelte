import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import SideRail from './SideRail.svelte';

var root = $.from_html(`<li><a> </a></li>`);
var root_1 = $.from_html(`<nav class="sp-toc svelte-pcfkz4"><p class="sp-toc__label svelte-pcfkz4">On this page</p> <ul class="svelte-pcfkz4"></ul></nav>`);
var root_2 = $.from_html(`<div class="sp-toc-wrap svelte-pcfkz4"><!> <!></div>`);

export default function TableOfContents($$anchor, $$props) {
	$.push($$props, true);

	let headings = $.state($.proxy([]));
	let activeId = $.state('');

	onMount(() => {
		let els = [];
		let raf = 0;

		const collect = () => {
			els = Array.from(document.querySelectorAll('.sp-post-content h2, .sp-post-content h3')).filter((el) => el.id);

			$.set(
				headings,
				els.map((el) => ({
					id: el.id,
					text: el.textContent ?? '',
					level: Number(el.tagName[1])
				})),
				true
			);
		};

		// Active = last heading whose top has crossed the trigger line
		// (20% from viewport top). Matches how Nuxt / VitePress handle it.
		const compute = () => {
			if (!els.length) return;

			const trigger = window.innerHeight * 0.2;
			let current = els[0].id;

			for (const el of els) {
				if (el.getBoundingClientRect().top - trigger < 1) current = el.id; else break;
			}

			// If we're above the first heading, no section is active yet.
			if (els[0].getBoundingClientRect().top > trigger) current = '';

			$.set(activeId, current, true);
		};

		const onScroll = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(compute);
		};

		collect();
		compute();

		// Re-collect once DOM settles (headings may render after mount via {@html}).
		tick().then(() => {
			collect();
			compute();
		});

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	var div = root_2();
	var node = $.child(div);

	SideRail(node, {
		get category() {
			return $$props.category;
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var nav = root_1();
			var ul = $.sibling($.child(nav), 2);

			$.each(ul, 21, () => $.get(headings), $.index, ($$anchor, h) => {
				var li = root();
				let classes;
				var a = $.child(li);
				let classes_1;
				var text = $.only_child(a, true);

				$.reset(li);

				$.template_effect(() => {
					classes = $.set_class(li, 1, 'sp-toc__item svelte-pcfkz4', null, classes, { 'sp-toc__item--h3': $.get(h).level === 3 });
					$.set_attribute(a, 'href', `#${$.get(h).id}`);
					classes_1 = $.set_class(a, 1, 'sp-toc__link svelte-pcfkz4', null, classes_1, { 'sp-toc__link--active': $.get(activeId) === $.get(h).id });
					$.set_text(text, $.get(h).text);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node_1, ($$render) => {
			if ($.get(headings).length) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}