import * as $ from 'svelte/internal/server';
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Copy_preset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className } = $$props;
		const designSystem = useDesignSystem();
		const clipboard = new UseClipboard();
		const presetCode = $.derived(() => new URL(designSystem.shareUrl).searchParams.get("preset") ?? "");

		function handleCopy() {
			clipboard.copy(`--preset ${presetCode()}`);
		}

		Button($$renderer, {
			variant: 'outline',
			onclick: handleCopy,
			class: cn("touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! pointer-coarse:h-10!", className),
			children: ($$renderer) => {
				$$renderer.push(`<span>${$.escape(clipboard.copied ? "Copied" : `--preset ${presetCode()}`)}</span>`);
			},
			$$slots: { default: true }
		});
	});
}