import * as $ from 'svelte/internal/server';
import { BROWSER } from 'esm-env';
import { onMount } from 'svelte';
import { useOptions } from '../options.svelte.js';
import { collapseString } from '../util.js';
import core from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';

const hljs = core.newInstance();

hljs.configure({ classPrefix: '' });
hljs.registerLanguage('xml', xml);

export default function HTMLValue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value } = $$props;
		let options = useOptions();

		const getOpenTag = (ele, stringCollapse) => {
			if (ele) {
				let tag = ele.innerHTML
					? ele.outerHTML.slice(0, ele.outerHTML.indexOf(ele.innerHTML))
					: ele.outerHTML;

				return collapseString(tag, stringCollapse);
			}

			return '';
		};

		const highlight = (markup) => hljs.highlight(markup, { language: 'xml' }).value;
		let highlighted = '';

		const mutationObserver = new MutationObserver(([mutation]) => {
			const outer = getOpenTag(mutation.target, options.value.stringCollapse);

			highlighted = highlight(outer);
		});

		onMount(() => {
			if (value) {
				const outer = getOpenTag(value, options.value.stringCollapse);

				highlighted = highlight(outer);
				mutationObserver.observe(value, { attributes: true });
			}

			return () => {
				mutationObserver.disconnect();
			};
		});

		if (BROWSER) {
			$$renderer.push(`<!--[0--><code data-testid="value" class="value html hl" title="">${$.html(highlighted)}</code>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}