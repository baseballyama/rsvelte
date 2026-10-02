import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";

var root = $.from_html(`<a target="_blank" class="underline">Open LLM source for this page</a>`);
var root_1 = $.from_html(`<ul><li><!></li></ul>`);

export default function LlmLink($$anchor, $$props) {
	$.push($$props, true);

	const pathname = page.url.pathname;
	const parts = pathname.split("/").filter(Boolean);
	const dirName = parts.at(-1); // "input-field"
	const parentDir = parts.at(-2); // "forms"
	var ul = root_1();
	var li = $.child(ul);
	var node = $.child(li);

	{
		var consequent = ($$anchor) => {
			var a = root();

			$.template_effect(() => $.set_attribute(a, 'href', `/llm/${$$props.link ?? ''}.md`));
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var a_1 = root();

			$.template_effect(() => $.set_attribute(a_1, 'href', `/llm/${parentDir ?? ''}/${dirName ?? ''}.md`));
			$.append($$anchor, a_1);
		};

		$.if(node, ($$render) => {
			if ($$props.link) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(li);
	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}