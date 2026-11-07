import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea } from "bits-ui";

var root = $.from_html(
	`<h4 class="text-foreground mb-4 mt-2 text-xl font-semibold leading-none tracking-[-0.01em]">Scroll Area</h4> <p class="text-foreground-alt text-wrap text-sm leading-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos impedit rem,
			repellat deserunt ducimus quasi nisi voluptatem cumque aliquid esse ea deleniti eveniet
			incidunt! Deserunt minus laborum accusamus iusto dolorum. Lorem ipsum dolor sit, amet
			consectetur adipisicing elit. Blanditiis officiis error minima eos fugit voluptate
			excepturi eveniet dolore et, ratione impedit consequuntur dolorem hic quae corrupti
			autem? Dolorem, sit voluptatum.</p>`,
	1
);

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scroll_area_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
		ScrollArea_Root($$anchor, {
			class: 'border-dark-10 bg-background-alt shadow-card relative overflow-hidden rounded-[10px] border px-4 py-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ScrollArea.Viewport, ($$anchor, ScrollArea_Viewport) => {
					ScrollArea_Viewport($$anchor, {
						class: 'h-full max-h-[200px] w-full max-w-[200px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();

							$.next(2);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar) => {
					ScrollArea_Scrollbar($$anchor, {
						orientation: 'vertical',
						class: 'bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all duration-200 hover:w-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb) => {
								ScrollArea_Thumb($$anchor, { class: 'bg-muted-foreground flex-1 rounded-full' });
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar_1) => {
					ScrollArea_Scrollbar_1($$anchor, {
						orientation: 'horizontal',
						class: 'bg-muted hover:bg-dark-10 flex h-2.5 touch-none select-none rounded-full border-t border-t-transparent p-px transition-all duration-200 hover:h-3 ',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb_1) => {
								ScrollArea_Thumb_1($$anchor, { class: 'bg-muted-foreground rounded-full' });
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_4, 2);

				$.component(node_6, () => ScrollArea.Corner, ($$anchor, ScrollArea_Corner) => {
					ScrollArea_Corner($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}