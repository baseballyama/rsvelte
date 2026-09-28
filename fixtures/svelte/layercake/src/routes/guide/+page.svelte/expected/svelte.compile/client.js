import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GuideContents from '../_site-components/GuideContents.svelte';

var root = $.from_html(`<meta name="og:title" content="Layer Cake — Guide"/> <meta name="twitter:title" content="Layer Cake — Guide"/>`, 1);
var root_1 = $.from_html(`<li class="svelte-36n0qb"><a class="svelte-36n0qb"> </a></li>`);
var root_2 = $.from_html(`<section class="svelte-36n0qb"><h2 class="svelte-36n0qb"> <small class="svelte-36n0qb"><a target="_blank" rel="noreferrer">edit this section</a></small></h2> <!></section>`);
var root_3 = $.from_html(`<sidebar class="svelte-36n0qb"><!></sidebar> <div id="container" class="content svelte-36n0qb"><section id="toc" class="svelte-36n0qb"><h3 class="svelte-36n0qb">Table of contents</h3> <ul class="svelte-36n0qb"></ul></section> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import('./$types').PageProps} */
	/** @type {HTMLElement | undefined} */
	let container;

	/** @type {number[]} */
	let positions = [];

	let lastId = 'introduction';
	let activeGuideSection = $.state(void 0);

	/** @type {HTMLElement[]} */
	let anchors = [];

	$.user_effect(() => {
		if (typeof window !== 'undefined' && container) {
			anchors = /** @type {HTMLElement[]} */ ([...container.querySelectorAll('[id]')]);
			lastId = window.location.hash.slice(1);
			$.set(activeGuideSection, lastId, true);
			onresize();
			onscroll();
		}
	});

	function onresize() {
		if (container) {
			const { top } = container.getBoundingClientRect();

			positions = anchors.map((anchor) => {
				return anchor.getBoundingClientRect().top - top;
			});
		}
	}

	function onscroll() {
		const top = -window.scrollY;
		let i = anchors.length;

		while (i--) {
			if (positions[i] + top < 100) {
				const anchor = anchors[i];
				const { id } = anchor;

				if (id !== lastId) {
					$.set(activeGuideSection, id, true);

					// this.fire('scroll', id);
					lastId = id;
				}

				return;
			}
		}
	}

	var fragment_1 = root_3();

	$.event('scroll', $.window, onscroll);
	$.event('resize', $.window, onresize);

	$.head('36n0qb', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'LayerCake - Guide';
		});

		$.append($$anchor, fragment);
	});

	var sidebar = $.first_child(fragment_1);
	var node = $.child(sidebar);

	GuideContents(node, {
		get sections() {
			return $$props.data.sections;
		},

		get activeGuideSection() {
			return $.get(activeGuideSection);
		},

		set activeGuideSection($$value) {
			$.set(activeGuideSection, $$value, true);
		}
	});

	$.reset(sidebar);

	var div = $.sibling(sidebar, 2);
	var section_1 = $.child(div);
	var ul = $.sibling($.child(section_1), 2);

	$.each(ul, 21, () => $$props.data.sections, $.index, ($$anchor, section) => {
		var li = root_1();
		var a = $.child(li);
		var text = $.only_child(a);

		$.reset(li);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', `#${$.get(section).slug ?? ''}`);
				$.set_text(text, `- ${$0 ?? ''}`);
			},
			[
				() => $.get(section).slug.replace(/^\w/, (d) => d.toUpperCase()).replaceAll('-', ' ')
			]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(section_1);

	var node_1 = $.sibling(section_1, 2);

	$.each(node_1, 17, () => $$props.data.sections, $.index, ($$anchor, section) => {
		var section_2 = root_2();
		var h2 = $.child(section_2);
		var text_1 = $.child(h2);
		var small = $.sibling(text_1);
		var a_1 = $.only_child(small);

		$.reset(h2);

		var node_2 = $.sibling(h2, 2);

		$.html(node_2, () => $.get(section).html);
		$.reset(section_2);

		$.template_effect(() => {
			$.set_attribute(section_2, 'id', $.get(section).slug);
			$.set_text(text_1, `${$.get(section).metadata.title ?? ''} `);
			$.set_attribute(a_1, 'href', `https://github.com/mhkeller/layercake/edit/master/src/content/guide/${$.get(section).file ?? ''}`);
		});

		$.append($$anchor, section_2);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, fragment_1);
	$.pop();
}