import 'svelte/internal/disclose-version';
import core from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import * as $ from 'svelte/internal/client';
import { BROWSER } from 'esm-env';
import { onMount } from 'svelte';
import { useOptions } from '../options.svelte.js';
import { collapseString } from '../util.js';

const hljs = core.newInstance();

hljs.configure({ classPrefix: '' });
hljs.registerLanguage('xml', xml);

var root = $.from_html(`<code data-testid="value" class="value html hl" title=""></code>`);

export default function HTMLValue($$anchor, $$props) {
	$.push($$props, true);

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
	let highlighted = $.state('');

	const mutationObserver = new MutationObserver(([mutation]) => {
		const outer = getOpenTag(mutation.target, options.value.stringCollapse);

		$.set(highlighted, highlight(outer), true);
	});

	onMount(() => {
		if ($$props.value) {
			const outer = getOpenTag($$props.value, options.value.stringCollapse);

			$.set(highlighted, highlight(outer), true);
			mutationObserver.observe($$props.value, { attributes: true });
		}

		return () => {
			mutationObserver.disconnect();
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var code = root();

			$.html(code, () => $.get(highlighted), true);
			$.reset(code);
			$.append($$anchor, code);
		};

		$.if(node, ($$render) => {
			if (BROWSER) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}