import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import PreviewSwitcher from "./preview-switcher.svelte";

export default function Preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item } = $$props;
		const designSystem = useDesignSystem();

		$$renderer.push(`<div data-slot="preview" class="relative -mx-1 flex flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-border sm:mx-0"><div${$.attr_class($.clsx(cn("z-0 mx-auto flex max-h-(--preview-height) w-full flex-1 flex-col overflow-y-auto")))}>`);

		Button($$renderer, {
			href: `/preview/${$.stringify(item)}${$.stringify(new URL(designSystem.shareUrl).search)}&fromPreview=true`,
			class: 'absolute top-2 right-2 isolate z-10',
			variant: 'ghost',
			size: 'icon-sm',
			children: ($$renderer) => {
				IconPlaceholder($$renderer, {
					lucide: 'MaximizeIcon',
					tabler: 'IconBorderCorners',
					hugeicons: 'ArrowExpandIcon',
					phosphor: 'CornersOutIcon',
					remixicon: 'RiExpandDiagonalLine'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <iframe${$.attr('src', `/preview/${$.stringify(item)}`)} class="h-(--preview-height)"${$.attr('title', item)}></iframe> `);
		PreviewSwitcher($$renderer, { item });
		$$renderer.push(`<!----></div></div>`);
	});
}