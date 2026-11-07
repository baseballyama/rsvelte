import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import CopyBtn from '../../_site-components/CopyBtn.svelte';
import DownloadBtn from '../../_site-components/DownloadBtn.svelte';
import hljsDefineSvelte from '../../../_modules/hljsDefineSvelte.js';
import cleanTitle from '../../../_modules/cleanTitle.js';
import constructReplLink from '../../../_modules/constructReplLink.js';
import examples from '../../_examples_ssr.js';

var root = $.from_html(`<a class="edit-repl svelte-1828h4i" target="_blank" rel="noreferrer">Edit</a>`);
var root_1 = $.from_html(`<div class="dek svelte-1828h4i"></div>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<div class="contents"><pre class="svelte-1828h4i"></pre></div>`);
var root_4 = $.from_html(`<div class="main svelte-1828h4i" data-label="Server-side"><h1> <!></h1> <div class="chart-hero svelte-1828h4i"><!></div> <div class="download svelte-1828h4i"><!></div> <!> <div id="pages"><ul id="page-nav" class="svelte-1828h4i"></ul> <div id="contents-container" class="svelte-1828h4i"><!> <!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	hljs.registerLanguage('svelte', hljsDefineSvelte);
	hljsDefineSvelte(hljs);

	const md = new MarkdownIt({ html: true, linkify: true });

	/** @type {import('./$types').PageProps} */
	let active = $.derived(() => $$props.data.active);

	/**
	 * @param {string} text
	 * @returns {string}
	 */
	function markdownToHtml(text) {
		return md.render(text);
	}

	/**
	 * @param {string} str
	 * @param {string} title
	 * @returns {string}
	 */
	function highlight(str, title) {
		const parts = title.split('.');
		let ext = parts[parts.length - 1];

		if (ext === 'csv') ext = 'diff';

		return hljs.highlight(str, { language: ext }).value;
	}

	let pages = $.derived(() => [$$props.data.content.main].concat($$props.data.content.components).concat($$props.data.content.componentModules).concat($$props.data.content.modules).concat($$props.data.content.componentComponents).concat($$props.data.content.jsons).concat($$props.data.content.csvs));
	const exampleLookup = new Map();

	examples.forEach((exmpl) => {
		exampleLookup.set(exmpl.slug.toLowerCase(), exmpl);
	});

	let example = $.derived(() => exampleLookup.get($$props.data.slug.toLowerCase()));
	var div = root_4();

	$.head('1828h4i', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = $.get(example).title ?? '';
		});
	});

	var h1 = $.child(div);
	var text_1 = $.child(h1, true);
	var node = $.sibling(text_1);

	$.await(node, () => constructReplLink($.get(example)?.title, $$props.data.content), null, ($$anchor, replLink) => {
		var a = root();

		$.template_effect(() => $.set_attribute(a, 'href', $.get(replLink)));
		$.append($$anchor, a);
	});

	$.reset(h1);

	var div_1 = $.sibling(h1, 2);
	var node_1 = $.child(div_1);

	$.component(node_1, () => $.get(example).component, ($$anchor, example_component) => {
		example_component($$anchor, {});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	DownloadBtn(node_2, {
		get data() {
			return $$props.data.content;
		},

		get slug() {
			return $$props.data.slug;
		},
		ssr: true
	});

	$.reset(div_2);

	var node_3 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_1();

			$.html(div_3, () => markdownToHtml($$props.data.content.dek), true);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_3, ($$render) => {
			if ($$props.data.content.dek) $$render(consequent);
		});
	}

	var div_4 = $.sibling(node_3, 2);
	var ul = $.child(div_4);

	$.each(ul, 21, () => $.get(pages), $.index, ($$anchor, page) => {
		var li = root_2();
		var text_2 = $.only_child(li, true);

		$.template_effect(
			($0) => {
				$.set_class(li, 1, `tab ${$0 ?? ''}`, 'svelte-1828h4i');
				$.set_text(text_2, $.get(page).title);
			},
			[
				() => $.get(active) === cleanTitle($.get(page).title) ? 'active' : ''
			]
		);

		$.delegated('click', li, () => $.set(active, cleanTitle($.get(page).title)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var div_5 = $.sibling(ul, 2);
	var node_4 = $.child(div_5);

	CopyBtn(node_4, {
		getText: () => $.get(pages).filter((d) => cleanTitle(d.title) === $.get(active))[0].contents
	});

	var node_5 = $.sibling(node_4, 2);

	$.each(node_5, 17, () => $.get(pages), $.index, ($$anchor, page) => {
		var div_6 = root_3();
		var pre = $.child(div_6);

		$.html(pre, () => highlight($.get(page).contents, $.get(page).title), true);
		$.reset(pre);
		$.reset(div_6);

		$.template_effect(($0) => $.set_style(div_6, `display: ${$0 ?? ''};`), [
			() => $.get(active) === cleanTitle($.get(page).title) ? 'block' : 'none'
		]);

		$.append($$anchor, div_6);
	});

	$.reset(div_5);
	$.reset(div_4);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text_1, $.get(example).title);
			$.set_attribute(div_1, 'data-slug', $0);
			$.set_class(div_4, 1, $.clsx($$props.data.content.dek ? 'has-dek' : ''), 'svelte-1828h4i');
		},
		[() => $$props.data.slug.toLowerCase()]
	);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);