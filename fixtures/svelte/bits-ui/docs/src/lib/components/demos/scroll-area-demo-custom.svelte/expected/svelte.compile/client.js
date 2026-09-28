import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea } from "bits-ui";
import DemoContainer from "../demo-container.svelte";
import { cn } from "$lib/utils/styles.js";

const Scrollbar = ($$anchor, $$arg0) => {
	let orientation = () => ($$arg0?.()).orientation;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar) => {
				ScrollArea_Scrollbar($$anchor, {
					get orientation() {
						return orientation();
					},
					class: 'bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all duration-200 hover:w-3',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb) => {
							ScrollArea_Thumb($$anchor, { class: 'bg-muted-foreground flex-1 rounded-full' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.component(node_3, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar_1) => {
				ScrollArea_Scrollbar_1($$anchor, {
					get orientation() {
						return orientation();
					},
					class: 'bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex h-2.5 touch-none select-none rounded-full border-t border-t-transparent p-px transition-all duration-200 hover:h-3',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						$.component(node_4, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb_1) => {
							ScrollArea_Thumb_1($$anchor, { class: 'd bg-muted-foreground rounded-full' });
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (orientation() === "vertical") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'orientation',
	'viewportClasses',
	'children'
]);

var root = $.from_html(
	`<h4 class="text-foreground mb-4 mt-2 text-xl font-semibold leading-none tracking-[-0.01em]">Scroll Area</h4> <p class="text-foreground-alt text-wrap text-sm leading-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos impedit
					rem, repellat deserunt ducimus quasi nisi voluptatem cumque aliquid esse ea
					deleniti eveniet incidunt! Deserunt minus laborum accusamus iusto dolorum. Lorem
					ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis officiis error
					minima eos fugit voluptate excepturi eveniet dolore et, ratione impedit
					consequuntur dolorem hic quae corrupti autem? Dolorem, sit voluptatum.</p>`,
	1
);

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scroll_area_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, "vertical"),
		restProps = $.rest_props($$props, rest_excludes);

	DemoContainer($$anchor, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_5 = $.first_child(fragment_6);

			$.component(node_5, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
				ScrollArea_Root($$anchor, $.spread_props(() => restProps, {
					class: 'border-dark-10 bg-background-alt shadow-card relative overflow-hidden rounded-[10px] border px-4 py-4',
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_6 = $.first_child(fragment_7);

						{
							let $0 = $.derived(() => cn("h-full max-h-[200px] w-full max-w-[200px]", $$props.viewportClasses));

							$.component(node_6, () => ScrollArea.Viewport, ($$anchor, ScrollArea_Viewport) => {
								ScrollArea_Viewport($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_7 = $.first_child(fragment_8);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_9 = $.comment();
												var node_8 = $.first_child(fragment_9);

												$.snippet(node_8, () => $$props.children ?? $.noop);
												$.append($$anchor, fragment_9);
											};

											var alternate_1 = ($$anchor) => {
												var fragment_10 = root();

												$.next(2);
												$.append($$anchor, fragment_10);
											};

											$.if(node_7, ($$render) => {
												if ($$props.children) $$render(consequent_1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_9 = $.sibling(node_6, 2);

						{
							var consequent_2 = ($$anchor) => {
								Scrollbar($$anchor, () => ({ orientation: "vertical" }));
							};

							$.if(node_9, ($$render) => {
								if (orientation() === "vertical" || orientation() === "both") $$render(consequent_2);
							});
						}

						var node_10 = $.sibling(node_9, 2);

						{
							var consequent_3 = ($$anchor) => {
								Scrollbar($$anchor, () => ({ orientation: "horizontal" }));
							};

							$.if(node_10, ($$render) => {
								if (orientation() === "horizontal" || orientation() === "both") $$render(consequent_3);
							});
						}

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => ScrollArea.Corner, ($$anchor, ScrollArea_Corner) => {
							ScrollArea_Corner($$anchor, {});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				}));
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.pop();
}