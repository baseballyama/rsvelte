import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<span> </span>`);

export default function Copy_preset($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	const clipboard = new UseClipboard();
	const presetCode = $.derived(() => new URL(designSystem.shareUrl).searchParams.get("preset") ?? "");

	function handleCopy() {
		clipboard.copy(`--preset ${$.get(presetCode)}`);
	}

	{
		let $0 = $.derived(() => cn("touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! pointer-coarse:h-10!", $$props.class));

		Button($$anchor, {
			variant: 'outline',
			onclick: handleCopy,
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, clipboard.copied ? "Copied" : `--preset ${$.get(presetCode)}`));
				$.append($$anchor, span);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}