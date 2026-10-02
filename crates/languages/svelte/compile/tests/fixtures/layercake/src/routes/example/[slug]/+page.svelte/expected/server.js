import * as $ from 'svelte/internal/server';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import CopyBtn from '../../_site-components/CopyBtn.svelte';
import DownloadBtn from '../../_site-components/DownloadBtn.svelte';
import hljsDefineSvelte from '../../../_modules/hljsDefineSvelte.js';
import cleanTitle from '../../../_modules/cleanTitle.js';
import constructReplLink from '../../../_modules/constructReplLink.js';
import examples from '../../_examples.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const md = new MarkdownIt({ html: true, linkify: true });

		hljs.registerLanguage('svelte', hljsDefineSvelte);
		hljsDefineSvelte(hljs);

		/** @type {import('./$types').PageProps} */
		let { data } = $$props;

		let active = $.derived(() => data.active);

		/**
		 * Converts markdown text to HTML.
		 * @param {string} text - The markdown text to convert.
		 * @returns {string} The converted HTML.
		 */
		function markdownToHtml(text) {
			return md.render(text);
		}

		/**
		 * @param {string} str
		 * @param {string} title
		 * @returns {string} highlighted code
		 */
		function highlight(str, title) {
			const parts = title.split('.');
			let ext = parts[parts.length - 1];

			if (ext === 'csv') ext = 'diff';

			return hljs.highlight(str, { language: ext }).value;
		}

		let pages = $.derived(() => [data.content.main].concat(data.content.components).concat(data.content.componentModules).concat(data.content.modules).concat(data.content.componentComponents).concat(data.content.jsons).concat(data.content.csvs));
		const exampleLookup = new Map();

		examples.forEach((exmpl) => {
			exampleLookup.set(exmpl.slug, exmpl);
		});

		let example = $.derived(() => exampleLookup.get(data.slug));

		$.head('8v3ccf', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(example()?.title || 'LayerCake Example')}</title>`);
			});
		});

		$$renderer.push(`<div class="main svelte-8v3ccf"><h1>${$.escape(example().title)} `);

		$.await($$renderer, constructReplLink(example()?.title, data.content), () => {}, (replLink) => {
			$$renderer.push(`<a class="edit-repl svelte-8v3ccf"${$.attr('href', replLink)} target="_blank" rel="noreferrer">Edit</a>`);
		});

		$$renderer.push(`<!--]--></h1> <div class="chart-hero svelte-8v3ccf">`);

		if (example().component) {
			$$renderer.push('<!--[-->');
			example().component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> <div class="download svelte-8v3ccf">`);
		DownloadBtn($$renderer, { data: data.content, slug: data.slug });
		$$renderer.push(`<!----></div> `);

		if (data.content.dek) {
			$$renderer.push(`<!--[0--><div class="dek svelte-8v3ccf">${$.html(markdownToHtml(data.content.dek))}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div id="pages"${$.attr_class($.clsx(data.content.dek ? 'has-dek' : ''), 'svelte-8v3ccf')}><ul id="page-nav" class="svelte-8v3ccf"><!--[-->`);

		const each_array = $.ensure_array_like(pages());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let page = each_array[$$index];

			$$renderer.push(`<li${$.attr_class(`tab ${active() === cleanTitle(page.title) ? 'active' : ''}`, 'svelte-8v3ccf')}>${$.escape(page.title)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <div id="contents-container" class="svelte-8v3ccf">`);

		CopyBtn($$renderer, {
			getText: () => pages().filter((d) => cleanTitle(d.title) === active())[0].contents
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array_1 = $.ensure_array_like(pages());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let page = each_array_1[$$index_1];

			$$renderer.push(`<div class="contents"${$.attr_style(`display: ${active() === cleanTitle(page.title) ? 'block' : 'none'};`)}><pre class="svelte-8v3ccf">${$.html(highlight(page.contents, page.title))}</pre></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}