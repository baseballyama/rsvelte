import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import { toast } from "svelte-sonner";
import { UserConfigContext } from "$lib/user-config.svelte.js";

var root = $.from_html(`<button class="group relative flex aspect-[3/1] w-full flex-1 cursor-pointer flex-col gap-2 text-(--text) sm:aspect-[2/3] sm:h-auto sm:w-auto [&amp;>svg]:absolute [&amp;>svg]:end-4 [&amp;>svg]:top-4 [&amp;>svg]:z-10 [&amp;>svg]:h-3.5 [&amp;>svg]:w-3.5 [&amp;>svg]:opacity-0 [&amp;>svg]:transition-opacity"><!> <div class="border-ghost w-full flex-1 rounded-md bg-(--bg) after:rounded-lg after:border-input md:rounded-lg"></div> <div class="flex w-full flex-col items-center justify-center gap-1"><span class="font-mono text-xs text-muted-foreground tabular-nums transition-colors group-hover:text-foreground group-data-[last-copied=true]:text-primary sm:hidden xl:flex"> </span> <span class="hidden font-mono text-xs text-muted-foreground tabular-nums transition-colors group-hover:text-foreground group-data-[last-copied=true]:text-primary sm:flex xl:hidden"> </span></div></button>`);

export default function Color($$anchor, $$props) {
	$.push($$props, true);

	const userConfig = UserConfigContext.get();
	var button = root();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			CheckIcon($$anchor, {
				class: 'group-hover:opacity-100 group-data-[last-copied=true]:opacity-100'
			});
		};

		var alternate = ($$anchor) => {
			ClipboardIcon($$anchor, { class: 'group-hover:opacity-100' });
		};

		$.if(node, ($$render) => {
			if ($$props.clipboard.copied) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var div = $.sibling(node, 4);
	var span = $.child(div);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div);
	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'data-last-copied', $$props.clipboard.lastCopied === $$props.color[userConfig.current.colorFormat]);
		$.set_style(button, `--bg: ${$$props.color.oklch ?? ''}; --text: ${$$props.color.foreground ?? ''};`);
		$.set_text(text, $$props.color.class);
		$.set_text(text_1, $$props.color.scale);
	});

	$.delegated('click', button, () => {
		$$props.clipboard.copy($$props.color[userConfig.current.colorFormat]);
		toast.success(`Copied ${$$props.color[userConfig.current.colorFormat]} to clipboard.`);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);