import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlockViewerCopyCodeButton from "./block-viewer-copy-code-button.svelte";
import BlockViewerFileTree from "./block-viewer-file-tree.svelte";
import { BlockViewerContext } from "./block-viewer.svelte";
import { getIconForLanguageExtension } from "./icons/icons.js";

var root = $.from_html(`<div class="me-3.5 flex overflow-hidden rounded-xl border bg-code text-code-foreground group-data-[view=preview]/block-view-wrapper:hidden md:h-(--height)"><div class="w-72"><!></div> <figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none"><figcaption class="flex h-12 shrink-0 items-center gap-2 border-b px-4 py-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"><!> <div class="ms-auto flex items-center gap-2"><!></div></figcaption> <div class="no-scrollbar overflow-y-auto"><!></div></figure></div>`);

export default function Block_viewer_code($$anchor, $$props) {
	$.push($$props, true);

	const ctx = BlockViewerContext.get();
	const file = $.derived(() => ctx.item.files?.find((f) => f.target === ctx.activeFile));
	const language = $.derived(() => $.get(file)?.target?.split(".").pop() ?? "svelte");
	const Icon = $.derived(() => getIconForLanguageExtension($.get(language)));
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var node_2 = $.child(div_1);

			BlockViewerFileTree(node_2, {});
			$.reset(div_1);

			var figure = $.sibling(div_1, 2);
			var figcaption = $.child(figure);
			var node_3 = $.child(figcaption);

			$.component(node_3, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, {});
			});

			var text = $.sibling(node_3);
			var div_2 = $.sibling(text);
			var node_4 = $.child(div_2);

			BlockViewerCopyCodeButton(node_4, {});
			$.reset(div_2);
			$.reset(figcaption);

			var div_3 = $.sibling(figcaption, 2);
			var node_5 = $.child(div_3);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_6 = $.first_child(fragment_1);

					$.html(node_6, () => $.get(file)?.highlightedContent);
					$.append($$anchor, fragment_1);
				};

				$.if(node_5, ($$render) => {
					if ($.get(file)?.highlightedContent) $$render(consequent);
				});
			}

			$.reset(div_3);

			$.attach(div_3, () => (node) => {
				if ($.get(file)?.highlightedContent) {
					ctx.activeFileCodeToCopy = node.innerText;
				}
			});

			$.reset(figure);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(figcaption, 'data-language', $.get(language));
				$.set_text(text, ` ${$.get(file)?.target ?? ''} `);
			});

			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(file)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}