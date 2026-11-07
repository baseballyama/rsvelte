import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/stores';
import '../app.css';
import theme from 'svelte-highlight/styles/night-owl';
import Contents from '../comp/Contents.svelte';
import RTLToggle from '../comp/RTLToggle.svelte';
import { pathIsCurrent } from '../comp/pathUtils';

var root = $.from_html(`<meta name="description" content="A Fantastic virtual list for Svelte 5 and above"/> <!>`, 1);
var root_1 = $.from_html(`<a data-sveltekit-preload-data="" class="svelte-12qhfyh"> </a>`);
var root_2 = $.from_html(`<div class="page-container svelte-12qhfyh"><div role="presentation" class="toc-container-space svelte-12qhfyh"></div> <main><!> <div class="controls svelte-12qhfyh"><div class="svelte-12qhfyh"><span>previous</span> <!></div> <div class="svelte-12qhfyh"><span>next</span> <!></div></div></main> <div class="toc-container svelte-12qhfyh"><div role="presentation" class="toc-contents-wrap svelte-12qhfyh"><h1 class="toc-head svelte-12qhfyh"><img alt="Icon" width="30" height="30"/> Svelte-Virtuallists</h1> <!></div> <!></div></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isRTL = $.state(false);

	const sections = [
		{
			title: 'Getting started',
			pages: [{ title: 'Introduction', path: '/' }]
		},

		{
			title: 'General Examples',
			pages: [
				{ title: 'Vertical', path: '/examples/vertical' },
				{ title: 'Horizontal', path: '/examples/horizontal' },
				{ title: 'Table/Grid', path: '/examples/table' },
				{ title: 'Variable Sizing', path: '/examples/variablesizing' },
				{ title: 'Positioning', path: '/examples/positioning' },
				{ title: 'Events', path: '/examples/events' }
			]
		}
	];

	const pages = $.proxy(sections.map((section) => section.pages).flat());
	const pageIdx = $.derived(() => pages.findIndex(({ path }) => pathIsCurrent(path, $page())));
	const curPage = $.derived(() => $.get(pageIdx) >= 0 ? pages[$.get(pageIdx)] : undefined);
	const prevPage = $.derived(() => $.get(pageIdx) >= 1 ? pages[$.get(pageIdx) - 1] : undefined);
	const nextPage = $.derived(() => $.get(pageIdx) >= 0 && $.get(pageIdx) < pages.length - 1 ? pages[$.get(pageIdx) + 1] : undefined);
	var div = root_2();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment), 2);

		$.html(node, () => theme);

		$.deferred_template_effect(() => {
			$.document.title = `Svelte-Virtuallists${$.get(curPage) ? ` - ${$.get(curPage).title}` : ''}`;
		});

		$.append($$anchor, fragment);
	});

	var main = $.sibling($.child(div), 2);
	let classes;
	var node_1 = $.child(main);

	$.snippet(node_1, () => $$props.children);

	var div_1 = $.sibling(node_1, 2);
	var div_2 = $.child(div_1);
	var span = $.child(div_2);
	let classes_1;
	var node_2 = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			var a = root_1();
			var text = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', base + $.get(prevPage).path);
				$.set_text(text, $.get(prevPage).title);
			});

			$.append($$anchor, a);
		};

		$.if(node_2, ($$render) => {
			if ($.get(prevPage)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var span_1 = $.child(div_3);
	let classes_2;
	var node_3 = $.sibling(span_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_1();
			var text_1 = $.only_child(a_1, true);

			$.template_effect(() => {
				$.set_attribute(a_1, 'href', base + $.get(nextPage).path);
				$.set_text(text_1, $.get(nextPage).title);
			});

			$.append($$anchor, a_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(nextPage)) $$render(consequent_1);
		});
	}

	$.reset(div_3);
	$.reset(div_1);
	$.reset(main);

	var div_4 = $.sibling(main, 2);
	var div_5 = $.child(div_4);
	var h1 = $.child(div_5);
	var img = $.child(h1);

	$.next();
	$.reset(h1);

	var node_4 = $.sibling(h1, 2);

	Contents(node_4, {
		get contents() {
			return sections;
		}
	});

	$.reset(div_5);

	var node_5 = $.sibling(div_5, 2);

	RTLToggle(node_5, {
		get isRTL() {
			return $.get(isRTL);
		},

		set isRTL($$value) {
			$.set(isRTL, $$value, true);
		}
	});

	$.reset(div_4);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(main, 1, 'svelte-12qhfyh', null, classes, { 'rtl-containers': $.get(isRTL) });
		classes_1 = $.set_class(span, 1, 'svelte-12qhfyh', null, classes_1, { faded: !$.get(prevPage) });
		classes_2 = $.set_class(span_1, 1, 'svelte-12qhfyh', null, classes_2, { faded: !$.get(nextPage) });
		$.set_attribute(img, 'src', `${base ?? ''}/favicon.svg`);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}