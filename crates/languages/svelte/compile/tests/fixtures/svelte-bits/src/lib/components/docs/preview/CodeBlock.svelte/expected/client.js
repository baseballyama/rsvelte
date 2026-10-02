import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { highlighter, resolveDocsCodeLang } from './code-block-shiki';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

var root = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`);
var root_1 = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`);
var root_2 = $.from_html(`<pre class="code-fallback"> </pre>`);
var root_3 = $.from_html(`<div class="code-highlighter"><button class="code-copy-button" type="button" aria-label="Copy code"><!></button> <!></div>`);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	let language = $.prop($$props, 'language', 3, 'svelte');
	let hlCore = $.state(null);

	highlighter.then((h) => {
		$.set(hlCore, h, true);
	});

	const trimmedCode = $.derived(() => $$props.code.trimEnd());
	const resolvedLang = $.derived(() => resolveDocsCodeLang(language()));

	const html = $.derived(() => {
		const hl = $.get(hlCore);
		const c = $.get(trimmedCode);
		const lang = $.get(resolvedLang);

		if (!hl) return '';

		return hl.codeToHtml(c, { lang, theme: 'svelte-bits' }) ?? '';
	});

	const clipboard = new UseClipboard();
	var div = root_3();
	var button = $.child(div);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.html(node_2, () => $.get(html));
			$.append($$anchor, fragment);
		};

		var alternate_1 = ($$anchor) => {
			var pre = root_2();
			var text = $.only_child(pre, true);

			$.template_effect(() => $.set_text(text, $$props.code));
			$.append($$anchor, pre);
		};

		$.if(node_1, ($$render) => {
			if ($.get(html)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_attribute(div, 'data-language', language()));
	$.delegated('click', button, () => clipboard.copy($$props.code));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);