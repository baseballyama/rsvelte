import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";
import { cn } from "$lib/utils";
import CodeIcon from "@lucide/svelte/icons/code";
import { Svelte, Terminal, CSS, TypeScript } from "$lib/components/icons";
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@lucide/svelte/icons/copy";
import Code from "$lib/components/ui/code/code.svelte";
import { scale } from "svelte/transition";

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<div class="flex h-10 items-center justify-between border-b border-neutral-300/50 bg-neutral-200/30 pr-2.5 pl-4 dark:border-neutral-800/60 dark:bg-neutral-900/30"><div class="flex items-center gap-2"><!> <span class="text-[13px] leading-none font-medium text-neutral-500"> </span></div> <button class="relative flex h-7 w-7 items-center justify-center rounded-md text-foreground outline-none focus-visible:ring-1 dark:text-neutral-500 dark:focus-visible:ring-neutral-800"><!></button></div>`);
var root_2 = $.from_html(`<div><!> <div><!></div></div>`);

export default function DocsCodeBlock($$anchor, $$props) {
	$.push($$props, true);

	// import TerminalIcon from "@lucide/svelte/icons/terminal";
	let code = $.prop($$props, 'code', 3, ""),
		fileName = $.prop($$props, 'fileName', 3, ""),
		lang = $.prop($$props, 'lang', 3, "bash"),
		_class = $.prop($$props, 'class', 3, "");

	let copyCode = new UseClipboard({ delay: 1000 });

	let handleCopy = async () => {
		await copyCode.copy(code());
	};

	var div = root_2();
	var node = $.child(div);

	{
		var consequent_5 = ($$anchor) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					Terminal($$anchor, {});
				};

				var consequent_1 = ($$anchor) => {
					Svelte($$anchor, {});
				};

				var consequent_2 = ($$anchor) => {
					CSS($$anchor, {});
				};

				var consequent_3 = ($$anchor) => {
					TypeScript($$anchor, {});
				};

				var alternate = ($$anchor) => {
					CodeIcon($$anchor, { size: 14, class: 'text-neutral-500 dark:text-neutral-600' });
				};

				$.if(node_1, ($$render) => {
					if (lang() === "bash") $$render(consequent); else if (lang() === "svelte") $$render(consequent_1, 1); else if (lang() === "css") $$render(consequent_2, 2); else if (lang() === "typescript") $$render(consequent_3, 3); else $$render(alternate, -1);
				});
			}

			var span = $.sibling(node_1, 2);
			var text = $.only_child(span, true);

			$.reset(div_2);

			var button = $.sibling(div_2, 2);
			var node_2 = $.child(button);

			{
				var consequent_4 = ($$anchor) => {
					var span_1 = root();
					var node_3 = $.child(span_1);

					CheckIcon(node_3, { size: 14 });
					$.reset(span_1);
					$.transition(1, span_1, () => scale, () => ({ start: 0.6 }));
					$.append($$anchor, span_1);
				};

				var alternate_1 = ($$anchor) => {
					var span_2 = root();
					var node_4 = $.child(span_2);

					CopyIcon(node_4, { size: 14 });
					$.reset(span_2);
					$.transition(1, span_2, () => scale, () => ({ start: 0.6 }));
					$.append($$anchor, span_2);
				};

				$.if(node_2, ($$render) => {
					if (copyCode.status === "success") $$render(consequent_4); else $$render(alternate_1, -1);
				});
			}

			$.reset(button);
			$.reset(div_1);
			$.template_effect(() => $.set_text(text, fileName()));
			$.delegated('click', button, handleCopy);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (fileName()) $$render(consequent_5);
		});
	}

	var div_3 = $.sibling(node, 2);
	var node_5 = $.child(div_3);

	Code(node_5, {
		class: 'no-scrollbar border-none [&_pre]:no-scrollbar',
		get code() {
			return code();
		},

		get lang() {
			return lang();
		},
		hideLines: true
	});

	$.reset(div_3);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn("relative overflow-hidden rounded-xl border border-neutral-300/50 bg-neutral-200/30 dark:border-neutral-800/60 dark:bg-neutral-900/40", _class()))
	]);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);