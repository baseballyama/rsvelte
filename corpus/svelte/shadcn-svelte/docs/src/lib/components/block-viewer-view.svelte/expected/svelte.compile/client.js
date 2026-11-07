import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Resizable from "$lib/registry/ui/resizable/index.js";
import BlockViewerIframe from "./block-viewer-iframe.svelte";
import { BlockViewerContext } from "./block-viewer.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="hidden group-data-[view=code]/block-view-wrapper:hidden md:h-(--height) lg:flex"><div class="relative grid w-full gap-4"><div class="absolute inset-0 end-4 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] bg-size-[20px_20px] dark:bg-[radial-gradient(#404040_1px,transparent_1px)]"></div> <!></div></div>`);

export default function Block_viewer_view($$anchor, $$props) {
	$.push($$props, true);

	const ctx = BlockViewerContext.get();

	var // const iframeHtml = `<iframe title="${ctx.item.name}" src="/view/${ctx.item.name}" height="930" class="bg-background no-scrollbar relative z-20 hidden w-full md:block"></iframe>`;
	div = root_1();

	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	$.component(node, () => Resizable.PaneGroup, ($$anchor, Resizable_PaneGroup) => {
		Resizable_PaneGroup($$anchor, {
			direction: 'horizontal',
			class: 'relative z-10 after:absolute after:inset-0 after:end-3 after:z-0 after:rounded-xl after:bg-surface/50',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Resizable.Pane, ($$anchor, Resizable_Pane) => {
					$.bind_this(
						Resizable_Pane($$anchor, {
							class: 'relative aspect-[4/2.5] overflow-hidden rounded-lg border bg-background md:aspect-auto md:rounded-xl',
							defaultSize: 100,
							minSize: 30,
							children: ($$anchor, $$slotProps) => {
								BlockViewerIframe($$anchor, {});
							},
							$$slots: { default: true }
						}),
						($$value) => ctx.resizablePaneRef = $$value,
						() => ctx?.resizablePaneRef
					);
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Resizable.Handle, ($$anchor, Resizable_Handle) => {
					Resizable_Handle($$anchor, {
						class: 'relative z-20 hidden w-3 bg-transparent p-0 after:absolute after:end-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 md:block'
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Resizable.Pane, ($$anchor, Resizable_Pane_1) => {
					Resizable_Pane_1($$anchor, { defaultSize: 0, minSize: 0 });
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}