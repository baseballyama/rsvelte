import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github.css';
import copy from 'copy-to-clipboard';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'autodetect',
	'language',
	'setLanguage',
	'ignoreIllegals',
	'code'
]);

var root = $.from_html(`<div class="svelte-ipr7k2"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M20 6L9 17l-5-5"></path></svg></div>`);
var root_1 = $.from_html(`<div class="svelte-ipr7k2"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path></svg></div>`);
var root_2 = $.from_html(`<div class="outerWrapper svelte-ipr7k2"><button class="copyButton svelte-ipr7k2" aria-label="Copy code"><!></button> <div class="wrapper svelte-ipr7k2"><div><code></code></div></div></div>`);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('xml', xml);

	let codeElement;

	function escapeHtml(value) {
		return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
	}

	let autodetect = $.prop($$props, 'autodetect', 3, true),
		language = $.prop($$props, 'language', 3, ''),
		setLanguage = $.prop($$props, 'setLanguage', 3, () => {}),
		ignoreIllegals = $.prop($$props, 'ignoreIllegals', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	let copying = $.state(0);
	let highlightedCode = $.state('');
	const cannotDetectLanguage = $.derived(() => !autodetect() && !hljs.getLanguage(language()));
	const className = $.derived(() => $.get(cannotDetectLanguage) ? '' : `hljs ${language()} ${$$props.class ?? ''}`);

	$.user_effect(() => {
		if (!$$props.code) return;

		if ($.get(cannotDetectLanguage)) {
			$.set(highlightedCode, escapeHtml($$props.code), true);
		}

		if (autodetect()) {
			const result = hljs.highlightAuto($$props.code);

			setLanguage()(result.language ?? '');
			$.set(highlightedCode, result.value, true);
		} else {
			const result = hljs.highlight($$props.code, { language: language(), ignoreIllegals: ignoreIllegals() });

			$.set(highlightedCode, result.value, true);
		}
	});

	$.user_effect(() => {
		if (codeElement) {
			// eslint-disable-next-line svelte/no-dom-manipulating
			codeElement.innerHTML = $.get(highlightedCode);
		}
	});

	function onCopy() {
		if (!$$props.code) return;

		copy($$props.code);
		$.update(copying);

		setTimeout(
			() => {
				$.update(copying, -1);
			},
			2000
		);
	}

	var div = root_2();
	var button = $.child(div);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(copying)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var div_3 = $.sibling(button, 2);
	var div_4 = $.child(div_3);
	var code_1 = $.child(div_4);

	$.bind_this(code_1, ($$value) => codeElement = $$value, () => codeElement);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div);
	$.template_effect(() => $.set_class(div_4, 1, `${$.get(className)} root`, 'svelte-ipr7k2'));
	$.delegated('click', button, onCopy);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);