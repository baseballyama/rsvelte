import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import CopyBtn from '../../_site-components/CopyBtn.svelte';
import DownloadComponentBtn from '../../_site-components/DownloadComponentBtn.svelte';
import hljsDefineSvelte from '../../../_modules/hljsDefineSvelte.js';
import components from '../../_components.js';

var root = $.from_html(`<div id="params-table" class="svelte-1dvj3d7"></div>`);
var root_1 = $.from_html(`<h3 class="svelte-1dvj3d7">SSR Examples:</h3>`);
var root_2 = $.from_html(`<li><a class="svelte-1dvj3d7"> </a></li>`);
var root_3 = $.from_html(`<!> <ul class="svelte-1dvj3d7"></ul>`, 1);
var root_4 = $.from_html(`<h3 class="svelte-1dvj3d7"> </h3> <!>`, 1);
var root_5 = $.from_html(`<li> </li>`);
var root_6 = $.from_html(`<div class="contents"><pre class="svelte-1dvj3d7"></pre></div>`);
var root_7 = $.from_html(`<div class="main svelte-1dvj3d7"><div class="all-components svelte-1dvj3d7"><a href="/components" class="svelte-1dvj3d7">← View all components</a></div> <h1 class="svelte-1dvj3d7"> </h1> <div class="chart-hero svelte-1dvj3d7"><!></div> <div class="download svelte-1dvj3d7"><!></div> <div class="dek svelte-1dvj3d7"></div> <!> <div id="used-in" class="svelte-1dvj3d7"><!></div> <div id="pages"><ul id="page-nav" class="svelte-1dvj3d7"></ul> <div id="contents-container" class="svelte-1dvj3d7"><!>  <!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	let active = $.derived(() => $$props.data.active);

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

	let pages = $.derived(() => [$$props.data.content.main].concat($$props.data.content.modules));
	const lookup = new Map();

	components.flatMap(/** @param {ComponentGroup} d */ (d) => d.components).forEach(/** @param {ComponentEntry} d */ (d) => {
		lookup.set(d.slug, d);
	});

	let component = $.derived(() => lookup.get($$props.data.slug));

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
	let jsdocTable = $.state('');

	// svelte-ignore state_referenced_locally
	if ($$props.data.content.hasjsDoctable === true) {
		// svelte-ignore state_referenced_locally
		jsdocTableBody = `${$$props.data.content.jsdocParsed.map(/** @param {JsdocProp} d */ (d) => `**${d.name}** ${printTypes(d.type)}|${printDefault(d.defaultValue)}|${printRequired(d.required)}|${d.description?.replace(/^(-|–|—)/g, '').trim()}`).join('\n')}`;

		// svelte-ignore state_referenced_locally
		$.set(jsdocTable, $$props.data.content.jsdocParsed.length ? `${jsdocTableHeader}\n${jsdocTableBody}` : '', true);
	}

	var div = root_7();

	$.head('1dvj3d7', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${$.get(component).slug ?? ''} component`;
		});
	});

	var h1 = $.sibling($.child(div), 2);
	var text_1 = $.only_child(h1);
	var div_1 = $.sibling(h1, 2);
	var node = $.child(div_1);

	$.component(node, () => $.get(component).component, ($$anchor, component_component) => {
		component_component($$anchor, {});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	DownloadComponentBtn(node_1, {
		get data() {
			return $$props.data.content;
		},

		get slug() {
			return $$props.data.slug;
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);

	$.html(div_3, () => markdownToHtml($$props.data.content.componentDescription), true);
	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();

			$.html(div_4, () => markdownToHtml($.get(jsdocTable)), true);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($$props.data.content.hasjsDoctable === true) $$render(consequent);
		});
	}

	var div_5 = $.sibling(node_2, 2);
	var node_3 = $.child(div_5);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_4();
			var h3 = $.first_child(fragment);
			var text_2 = $.only_child(h3);
			var node_4 = $.sibling(h3, 2);

			$.each(node_4, 17, () => $$props.data.content.usedIn, $.index, ($$anchor, group) => {
				var fragment_1 = $.comment();
				var node_5 = $.first_child(fragment_1);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_2 = root_3();
						var node_6 = $.first_child(fragment_2);

						{
							var consequent_1 = ($$anchor) => {
								var h3_1 = root_1();

								$.append($$anchor, h3_1);
							};

							$.if(node_6, ($$render) => {
								if ($.get(group).group === 'SSR' && $$props.data.content.usedIn[0].matches.length > 0) $$render(consequent_1);
							});
						}

						var ul = $.sibling(node_6, 2);

						$.each(ul, 21, () => $.get(group).matches, $.index, ($$anchor, link) => {
							var li = root_2();
							var a = $.child(li);
							var text_3 = $.only_child(a, true);

							$.reset(li);

							$.template_effect(
								($0) => {
									$.set_attribute(a, 'href', $.get(link));
									$.set_text(text_3, $0);
								},
								[() => $.get(link).split('/').pop()]
							);

							$.append($$anchor, li);
						});

						$.reset(ul);
						$.append($$anchor, fragment_2);
					};

					$.if(node_5, ($$render) => {
						if ($.get(group).matches.length > 0) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.template_effect(() => $.set_text(text_2, `Used in these${$$props.data.content.usedIn[0].matches.length === 0 && $$props.data.content.usedIn[1].matches.length > 0 ? ' SSR' : ''} examples:`));
			$.append($$anchor, fragment);
		};

		$.if(node_3, ($$render) => {
			if ($$props.data.content.usedIn[0].matches.length > 0 || $$props.data.content.usedIn[1].matches.length > 0) $$render(consequent_3);
		});
	}

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var ul_1 = $.child(div_6);

	$.each(ul_1, 21, () => $.get(pages), $.index, ($$anchor, page) => {
		var li_1 = root_5();
		var text_4 = $.only_child(li_1, true);

		$.template_effect(() => {
			$.set_class(li_1, 1, `tab ${$.get(active) === $.get(page).slug ? 'active' : ''}`, 'svelte-1dvj3d7');
			$.set_text(text_4, $.get(page).slug);
		});

		$.delegated('click', li_1, () => $.set(active, $.get(page).slug));
		$.event('keypress', li_1, () => $.set(active, $.get(page).slug));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);

	var div_7 = $.sibling(ul_1, 2);
	var node_7 = $.child(div_7);

	CopyBtn(node_7, { getText: () => $.get(pages)[0].contents });

	var node_8 = $.sibling(node_7, 2);

	$.each(node_8, 17, () => $.get(pages), $.index, ($$anchor, page) => {
		var div_8 = root_6();
		var pre = $.child(div_8);

		$.html(pre, () => highlight($.get(page).contents, $.get(page).slug), true);
		$.reset(pre);
		$.reset(div_8);
		$.template_effect(() => $.set_style(div_8, `display: ${$.get(active) === $.get(page).slug ? 'block' : 'none'};`));
		$.append($$anchor, div_8);
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, `${$.get(component).slug ?? ''} component`);
		$.set_class(div_6, 1, $.clsx($$props.data.content.dek ? 'has-dek' : ''), 'svelte-1dvj3d7');
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);