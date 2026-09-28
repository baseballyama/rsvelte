import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import PreviewSwitcher from "./preview-switcher.svelte";

var root = $.from_html(`<div data-slot="preview" class="relative -mx-1 flex flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-border sm:mx-0"><div><!> <iframe class="h-(--preview-height)"></iframe> <!></div></div>`);

export default function Preview($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		get href() {
			return `/preview/${$$props.item ?? ''}${new URL(designSystem.shareUrl).search ?? ''}&fromPreview=true`;
		},
		class: 'absolute top-2 right-2 isolate z-10',
		variant: 'ghost',
		size: 'icon-sm',
		children: ($$anchor, $$slotProps) => {
			IconPlaceholder($$anchor, {
				lucide: 'MaximizeIcon',
				tabler: 'IconBorderCorners',
				hugeicons: 'ArrowExpandIcon',
				phosphor: 'CornersOutIcon',
				remixicon: 'RiExpandDiagonalLine'
			});
		},
		$$slots: { default: true }
	});

	var iframe = $.sibling(node, 2);
	var node_1 = $.sibling(iframe, 2);

	PreviewSwitcher(node_1, {
		get item() {
			return $$props.item;
		}
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div_1, 1, $0);
			$.set_attribute(iframe, 'src', `/preview/${$$props.item ?? ''}`);
			$.set_attribute(iframe, 'title', $$props.item);
		},
		[
			() => $.clsx(cn("z-0 mx-auto flex max-h-(--preview-height) w-full flex-1 flex-col overflow-y-auto"))
		]
	);

	$.append($$anchor, div);
	$.pop();
}