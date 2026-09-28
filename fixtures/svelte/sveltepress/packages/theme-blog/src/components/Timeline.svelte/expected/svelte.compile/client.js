import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { onMount } from 'svelte';

var root = $.from_html(`<span class="sp-tl__cat svelte-yy4qai"> </span>`);
var root_1 = $.from_html(`<span class="sp-tl__tag svelte-yy4qai"> </span>`);
var root_2 = $.from_html(`<div class="sp-tl__tags svelte-yy4qai"></div>`);
var root_3 = $.from_html(`<li class="sp-tl__item svelte-yy4qai" data-reveal=""><span class="sp-tl__dot svelte-yy4qai" aria-hidden="true"></span> <a class="sp-tl__card svelte-yy4qai"><div class="sp-tl__meta svelte-yy4qai"><time class="sp-tl__date svelte-yy4qai"> </time> <!> <span class="sp-tl__reading svelte-yy4qai"> </span></div> <h2 class="sp-tl__post-title svelte-yy4qai"> </h2> <p class="sp-tl__excerpt svelte-yy4qai"> </p> <!></a></li>`);
var root_4 = $.from_html(`<section class="sp-tl__year-group svelte-yy4qai"><div class="sp-tl__year-col svelte-yy4qai"><div class="sp-tl__year svelte-yy4qai" data-reveal=""><span class="sp-tl__year-num svelte-yy4qai"> </span> <span class="sp-tl__year-sub svelte-yy4qai"> </span> <span class="sp-tl__year-count svelte-yy4qai"> </span></div></div> <ol class="sp-tl__list svelte-yy4qai"></ol></section>`);
var root_5 = $.from_html(`<div class="sp-tl svelte-yy4qai"><header class="sp-tl__hero svelte-yy4qai"><span class="sp-tl__eyebrow svelte-yy4qai">Archive</span> <h1 class="sp-tl__title svelte-yy4qai">Timeline <span class="sp-tl__title-accent svelte-yy4qai">.</span></h1> <p class="sp-tl__subtitle svelte-yy4qai"><strong class="svelte-yy4qai"> </strong> <span class="sp-tl__sep svelte-yy4qai">·</span> <strong class="svelte-yy4qai"> </strong></p></header> <!></div>`);

export default function Timeline($$anchor, $$props) {
	$.push($$props, true);

	const MONTHS_SHORT = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	const MONTHS_LONG = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Posts are already sorted desc by date. Group by year+month, preserving order.
	const groups = $.derived(() => {
		const map = new Map();

		for (const p of $$props.posts) {
			const key = p.date.slice(0, 7);

			if (!map.has(key)) map.set(key, []);

			map.get(key).push(p);
		}

		return Array.from(map, ([key, posts]) => {
			const [year, m] = key.split('-');

			return { key, year, month: MONTHS_LONG[Number(m) - 1], posts };
		});
	});

	function fmtDate(iso) {
		const [, m, d] = iso.split('-');

		return `${MONTHS_SHORT[Number(m) - 1]} ${Number(d)}`;
	}

	const totalPosts = $.derived(() => $$props.posts.length);

	const yearSpan = $.derived(() => {
		if (!$$props.posts.length) return '';

		const newest = $$props.posts[0].date.slice(0, 4);
		const oldest = $$props.posts[$$props.posts.length - 1].date.slice(0, 4);

		return newest === oldest ? newest : `${oldest}–${newest}`;
	});

	let container = $.state(void 0);

	onMount(() => {
		if (!$.get(container)) return;

		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.classList.add('is-visible');
						io.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
		);

		$.get(container).querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

		return () => io.disconnect();
	});

	var div = root_5();
	var header = $.child(div);
	var p_1 = $.sibling($.child(header), 4);
	var strong = $.child(p_1);
	var text = $.only_child(strong, true);
	var text_1 = $.sibling(strong);
	var strong_1 = $.sibling(text_1, 3);
	var text_2 = $.only_child(strong_1, true);

	$.reset(p_1);
	$.reset(header);

	var node = $.sibling(header, 2);

	$.each(node, 19, () => $.get(groups), (group) => group.key, ($$anchor, group, gi) => {
		var section = root_4();
		var div_1 = $.child(section);
		var div_2 = $.child(div_1);
		var span = $.child(div_2);
		var text_3 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_4 = $.only_child(span_1, true);
		var span_2 = $.sibling(span_1, 2);
		var text_5 = $.only_child(span_2);

		$.reset(div_2);
		$.reset(div_1);

		var ol = $.sibling(div_1, 2);

		$.each(ol, 23, () => $.get(group).posts, (post) => post.slug, ($$anchor, post, i) => {
			var li = root_3();
			var a = $.sibling($.child(li), 2);
			var div_3 = $.child(a);
			var time = $.child(div_3);
			var text_6 = $.only_child(time, true);
			var node_1 = $.sibling(time, 2);

			{
				var consequent = ($$anchor) => {
					var span_3 = root();
					var text_7 = $.only_child(span_3, true);

					$.template_effect(() => $.set_text(text_7, $.get(post).category));
					$.append($$anchor, span_3);
				};

				$.if(node_1, ($$render) => {
					if ($.get(post).category) $$render(consequent);
				});
			}

			var span_4 = $.sibling(node_1, 2);
			var text_8 = $.only_child(span_4);

			$.reset(div_3);

			var h2 = $.sibling(div_3, 2);
			var text_9 = $.only_child(h2, true);
			var p_2 = $.sibling(h2, 2);
			var text_10 = $.only_child(p_2, true);
			var node_2 = $.sibling(p_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_4 = root_2();

					$.each(div_4, 21, () => $.get(post).tags, $.index, ($$anchor, tag) => {
						var span_5 = root_1();
						var text_11 = $.only_child(span_5);

						$.template_effect(() => $.set_text(text_11, `#${$.get(tag) ?? ''}`));
						$.append($$anchor, span_5);
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_2, ($$render) => {
					if ($.get(post).tags.length) $$render(consequent_1);
				});
			}

			$.reset(a);
			$.reset(li);

			$.template_effect(
				($0) => {
					$.set_style(li, `--i: ${$.get(i) ?? ''}`);
					$.set_attribute(a, 'href', `${base}/posts/${$.get(post).slug}/`);
					$.set_text(text_6, $0);
					$.set_text(text_8, `${$.get(post).readingTime ?? ''} min`);
					$.set_text(text_9, $.get(post).title);
					$.set_text(text_10, $.get(post).excerpt);
				},
				[() => fmtDate($.get(post).date)]
			);

			$.append($$anchor, li);
		});

		$.reset(ol);
		$.reset(section);

		$.template_effect(() => {
			$.set_style(section, `--gi: ${$.get(gi) ?? ''}`);
			$.set_text(text_3, $.get(group).month);
			$.set_text(text_4, $.get(group).year);

			$.set_text(text_5, `${$.get(group).posts.length ?? ''}
            ${$.get(group).posts.length === 1 ? 'post' : 'posts'}`);
		});

		$.append($$anchor, section);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(container, $$value), () => $.get(container));

	$.template_effect(() => {
		$.set_text(text, $.get(totalPosts));
		$.set_text(text_1, ` ${$.get(totalPosts) === 1 ? 'post' : 'posts'} `);
		$.set_text(text_2, $.get(yearSpan));
	});

	$.append($$anchor, div);
	$.pop();
}