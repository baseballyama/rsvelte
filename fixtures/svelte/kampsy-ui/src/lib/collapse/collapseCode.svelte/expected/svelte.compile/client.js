import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";
import { slide } from "svelte/transition";
import ChevronRightSmall from "$lib/icons/chevron-right-small.svelte";

var root = $.from_html(`<div class="ui-scrollbar text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 scroll-smoth h-auto w-full overflow-x-auto px-6 text-[13px]"><div><pre class="language-tsx">
            <code class="language-tsx">
                
                <!>
            </code>
        </pre></div></div>`);

var root_1 = $.from_html(`<button><div class="flex items-center gap-x-2"><div><!></div> <span class="text-sm leading-5 font-normal first-letter:capitalize"> </span></div></button> <!>`, 1);

export default function CollapseCode($$anchor, $$props) {
	$.push($$props, true);

	let isActive = $.state(false);

	const toggleFunc = () => {
		$.set(isActive, !$.get(isActive));
	};

	let rotate180 = $.derived(() => {
		if ($.get(isActive)) {
			return "rotate-90";
		}

		return "";
	});

	let title = $.derived(() => {
		if ($.get(isActive)) {
			return "Hide code";
		}

		return "Show code";
	});

	let border = $.derived(() => {
		if ($.get(isActive)) {
			return "border-y";
		}

		return "border-t";
	});

	const highlightedCode = hljs.highlight($$props.code, { language: "tsx" }).value;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var div = $.child(button);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	ChevronRightSmall(node, {});
	$.reset(div_1);

	var span = $.sibling(div_1, 2);
	var text = $.only_child(span, true);

	$.reset(div);
	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var div_3 = $.child(div_2);
			var pre = $.child(div_3);
			var code_1 = $.sibling($.child(pre));
			var node_2 = $.sibling($.child(code_1));

			$.html(node_2, () => highlightedCode);
			$.next();
			$.reset(code_1);
			$.next();
			$.reset(pre);
			$.reset(div_3);
			$.reset(div_2);
			$.transition(3, div_3, () => slide);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isActive)) $$render(consequent);
		});
	}

	$.template_effect(() => {
		$.set_class(button, 1, `text-kui-light-gray-900 hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:hover:text-kui-dark-gray-1000 bg-kui-light-bg-secondary
	 dark:bg-kui-dark-bg-secondary h-12 w-full
	  px-4 ${$.get(border) ?? ''} border-kui-light-gray-200 dark:border-kui-dark-gray-400
	   cursor-pointer`);

		$.set_class(div_1, 1, `h-4 w-4 ${$.get(rotate180) ?? ''} transform-gpu duration-200`);
		$.set_text(text, $.get(title));
	});

	$.delegated('click', button, toggleFunc);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);