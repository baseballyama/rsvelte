import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";

var root = $.from_html(`<div class="ui-scrollbar scroll-smoth h-auto w-full overflow-x-auto px-6 text-[13px]"><pre>
        <code>
            
            <!>
        </code>
    </pre></div>`);

export default function CodeSnip($$anchor, $$props) {
	$.push($$props, true);

	let lang = $.prop($$props, 'lang', 3, "tsx"),
		language = $.prop($$props, 'language', 3, "language-tsx");

	const highlightedCode = hljs.highlight($$props.code, { language: lang() }).value;
	var div = root();
	var pre = $.child(div);
	var code_1 = $.sibling($.child(pre));
	var node = $.sibling($.child(code_1));

	$.html(node, () => highlightedCode);
	$.next();
	$.reset(code_1);
	$.next();
	$.reset(pre);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(pre, 1, $.clsx(language()));
		$.set_class(code_1, 1, $.clsx(language()));
	});

	$.append($$anchor, div);
	$.pop();
}