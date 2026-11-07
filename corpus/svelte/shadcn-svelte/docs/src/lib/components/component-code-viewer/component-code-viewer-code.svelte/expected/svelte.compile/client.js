import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentCodeViewerCodeTitle from "./component-code-viewer-code-title.svelte";
import ComponentCodeViewerFileTree from "./component-code-viewer-file-tree.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";

var root = $.from_html(`<div class="hidden w-72 md:block"><!></div>`);
var root_1 = $.from_html(`<div class="flex h-(--height) overflow-hidden rounded-xl border bg-code text-code-foreground group-data-[view=preview]/block-view-wrapper:hidden"><!> <figure data-rehype-pretty-code-figure="" class="mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none"><!> <div class="no-scrollbar overflow-y-auto"></div></figure></div>`);

export default function Component_code_viewer_code($$anchor, $$props) {
	$.push($$props, true);

	const ctx = ComponentCodeViewerContext.get();
	const file = $.derived(() => ctx.highlightedFiles?.find((f) => f.target === ctx.activeFile));
	const showFileTree = $.derived(() => ctx.allowSidebar !== false);
	let codeContainer = $.state(null);

	function handleKeydown(event) {
		if (!$.get(codeContainer)) return;

		if (event.key === "a" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();

			const range = document.createRange();

			range.selectNodeContents($.get(codeContainer));

			const selection = window.getSelection();

			if (!selection) return;

			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	var fragment = $.comment();

	$.event('keydown', $.document, handleKeydown);

	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var node_2 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();
					var node_3 = $.child(div_1);

					ComponentCodeViewerFileTree(node_3, {});
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(showFileTree)) $$render(consequent);
				});
			}

			var figure = $.sibling(node_2, 2);
			var node_4 = $.child(figure);

			ComponentCodeViewerCodeTitle(node_4, {});

			var div_2 = $.sibling(node_4, 2);

			$.html(div_2, () => $.get(file).highlightedContent, true);
			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(codeContainer, $$value), () => $.get(codeContainer));

			$.attach(div_2, () => (node) => {
				if ($.get(file).highlightedContent) {
					ctx.activeFileCodeToCopy = node.innerText;
				}
			});

			$.reset(figure);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(file)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}