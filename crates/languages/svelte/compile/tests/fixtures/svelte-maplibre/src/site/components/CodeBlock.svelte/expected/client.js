import 'svelte/internal/disclose-version';
import hljs from 'highlight.js';
import hljsSvelte from 'highlightjs-svelte/dist/index.mjs';
import * as $ from 'svelte/internal/client';
import 'highlight.js/styles/github-dark.css';
import { cn } from '$site/utils.js';

hljsSvelte(hljs);

var root = $.from_html(`<pre><code></code></pre>`);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	let language = $.prop($$props, 'language', 3, 'svelte'),
		className = $.prop($$props, 'class', 3, undefined);

	let highlighted = $.derived(() => {
		try {
			return hljs.highlight($$props.code, { language: language() }).value;
		} catch {
			return hljs.highlightAuto($$props.code).value;
		}
	});

	var pre = root();
	var code_1 = $.child(pre);

	$.html(code_1, () => $.get(highlighted), true);
	$.reset(code_1);
	$.reset(pre);

	$.template_effect(
		($0) => {
			$.set_class(pre, 1, $0);
			$.set_class(code_1, 1, `hljs language-${language() ?? ''} !bg-transparent !p-0`);
		},
		[
			() => $.clsx(cn('overflow-x-auto rounded-lg border border-white/10 bg-[#0d1117] p-4 text-sm leading-relaxed shadow-sm', className()))
		]
	);

	$.append($$anchor, pre);
	$.pop();
}