import * as $ from 'svelte/internal/server';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import CopyBtn from '../../_site-components/CopyBtn.svelte';
import DownloadComponentBtn from '../../_site-components/DownloadComponentBtn.svelte';
import hljsDefineSvelte from '../../../_modules/hljsDefineSvelte.js';
import components from '../../_components.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {{
		 *   kind: string,
		 *   type: string,
		 *   name: string,
		 *   required: boolean,
		 *   defaultValue: string | null,
		 *   description: string
		 * }} JsdocProp
		 *
		 * @typedef {{
		 *   slug: string,
		 *   name?: string,
		 *   component: import('svelte').Component
		 * }} ComponentEntry
		 *
		 * @typedef {{
		 *   name: string,
		 *   components: ComponentEntry[]
		 * }} ComponentGroup
		 */
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
		 * @param {string} s
		 * @returns {string} highlighted code
		 */
		function highlight(str, s) {
			const parts = s.split('.');
			let ext = parts[parts.length - 1];

			if (ext === 'csv') ext = 'diff';

			return hljs.highlight(str, { language: ext }).value;
		}

		let pages = $.derived(() => [data.content.main].concat(data.content.modules));
		const lookup = new Map();

		components.flatMap(/** @param {ComponentGroup} d */ (d) => d.components).forEach(/** @param {ComponentEntry} d */ (d) => {
			lookup.set(d.slug, d);
		});

		let component = $.derived(() => lookup.get(data.slug));

		/**
		 * @param {string} type
		 * @returns {string}
		 */
		function printTypes(type) {
			if (type.includes('|')) {
				const escaped = type.split('|').map(/** @param {string} d */ (d) => `\`${d}\``).join(' &vert; ');

				return `(${escaped})`;
			} else return `\`${type}\``;
		}

		/**
		 * @param {string | null | undefined} def
		 * @returns {string}
		 */
		function printDefault(def) {
			if (!def) return 'None';

			return `\`${def}\``;
		}

		/**
		 * @param {boolean|undefined} required
		 * @returns {string}
		 */
		function printRequired(required) {
			const str = required ? 'yes' : 'no';

			return `<center>${str}</center>`;
		}

		const jsdocTableHeader = `|Param|Default|Required|Description|
|-----|-------|--------|-----------|`;

		let jsdocTableBody = '';
		let jsdocTable = '';

		// svelte-ignore state_referenced_locally
		if (data.content.hasjsDoctable === true) {
			// svelte-ignore state_referenced_locally
			jsdocTableBody = `${data.content.jsdocParsed.map(/** @param {JsdocProp} d */ (d) => `**${d.name}** ${printTypes(d.type)}|${printDefault(d.defaultValue)}|${printRequired(d.required)}|${d.description?.replace(/^(-|–|—)/g, '').trim()}`).join('\n')}`;

			// svelte-ignore state_referenced_locally
			jsdocTable = data.content.jsdocParsed.length ? `${jsdocTableHeader}\n${jsdocTableBody}` : '';
		}

		$.head('1dvj3d7', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(component().slug)} component</title>`);
			});
		});

		$$renderer.push(`<div class="main svelte-1dvj3d7"><div class="all-components svelte-1dvj3d7"><a href="/components" class="svelte-1dvj3d7">← View all components</a></div> <h1 class="svelte-1dvj3d7">${$.escape(component().slug)} component</h1> <div class="chart-hero svelte-1dvj3d7">`);

		if (component().component) {
			$$renderer.push('<!--[-->');
			component().component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> <div class="download svelte-1dvj3d7">`);
		DownloadComponentBtn($$renderer, { data: data.content, slug: data.slug });
		$$renderer.push(`<!----></div> <div class="dek svelte-1dvj3d7">${$.html(markdownToHtml(data.content.componentDescription))}</div> `);

		if (data.content.hasjsDoctable === true) {
			$$renderer.push(`<!--[0--><div id="params-table" class="svelte-1dvj3d7">${$.html(markdownToHtml(jsdocTable))}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div id="used-in" class="svelte-1dvj3d7">`);

		if (data.content.usedIn[0].matches.length > 0 || data.content.usedIn[1].matches.length > 0) {
			$$renderer.push(`<!--[0--><h3 class="svelte-1dvj3d7">Used in these${$.escape(data.content.usedIn[0].matches.length === 0 && data.content.usedIn[1].matches.length > 0 ? ' SSR' : '')} examples:</h3> <!--[-->`);

			const each_array = $.ensure_array_like(data.content.usedIn);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let group = each_array[$$index_1];

				if (group.matches.length > 0) {
					$$renderer.push('<!--[0-->');

					if (group.group === 'SSR' && data.content.usedIn[0].matches.length > 0) {
						$$renderer.push(`<!--[0--><h3 class="svelte-1dvj3d7">SSR Examples:</h3>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <ul class="svelte-1dvj3d7"><!--[-->`);

					const each_array_1 = $.ensure_array_like(group.matches);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let link = each_array_1[$$index];

						$$renderer.push(`<li><a${$.attr('href', link)} class="svelte-1dvj3d7">${$.escape(link.split('/').pop())}</a></li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div id="pages"${$.attr_class($.clsx(data.content.dek ? 'has-dek' : ''), 'svelte-1dvj3d7')}><ul id="page-nav" class="svelte-1dvj3d7"><!--[-->`);

		const each_array_2 = $.ensure_array_like(pages());

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let page = each_array_2[$$index_2];

			$$renderer.push(`<li${$.attr_class(`tab ${active() === page.slug ? 'active' : ''}`, 'svelte-1dvj3d7')}>${$.escape(page.slug)}</li>`);
		}

		$$renderer.push(`<!--]--></ul> <div id="contents-container" class="svelte-1dvj3d7">`);
		CopyBtn($$renderer, { getText: () => pages()[0].contents });
		$$renderer.push(`<!---->  <!--[-->`);

		const each_array_3 = $.ensure_array_like(pages());

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let page = each_array_3[$$index_3];

			$$renderer.push(`<div class="contents"${$.attr_style(`display: ${active() === page.slug ? 'block' : 'none'};`)}><pre class="svelte-1dvj3d7">${$.html(highlight(page.contents, page.slug))}</pre></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}