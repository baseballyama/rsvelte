import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { H1, Paragraph } from "$lib/components/markdown/index";
import { getDocsLayoutContext } from "./docs-layout-context";

var root = $.from_html(`<div class="mx-auto w-full max-w-4xl"><article class="min-w-0 space-y-8" data-doc-content=""><section><!> <!></section> <!></article></div>`);

export default function DocsPageShell($$anchor, $$props) {
	$.push($$props, true);

	const { registerDocContent } = getDocsLayoutContext();
	let contentRef = $.state(void 0);

	$.user_effect(() => {
		registerDocContent($.get(contentRef));

		return () => {
			registerDocContent(undefined);
		};
	});

	var div = root();
	var article = $.child(div);
	var section = $.child(article);
	var node = $.child(section);

	H1(node, {
		id: 'introduction',
		class: 'tracking-tighter',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Paragraph($$anchor, {
				class: 'mt-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $$props.description));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($$props.description) $$render(consequent);
		});
	}

	$.reset(section);

	var node_2 = $.sibling(section, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(article);
	$.bind_this(article, ($$value) => $.set(contentRef, $$value), () => $.get(contentRef));
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}