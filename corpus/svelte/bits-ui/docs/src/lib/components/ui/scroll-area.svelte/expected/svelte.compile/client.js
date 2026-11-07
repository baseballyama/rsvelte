import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";
import { ScrollArea } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'children',
	'scrollbarXProps',
	'scrollbarYProps',
	'orientation'
]);

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scroll_area($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, "both"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
		ScrollArea_Root($$anchor, $.spread_props(() => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn("max-h-[400px] max-w-[800px] py-3.5 pr-3.5", $$props.class));

					$.component(node_1, () => ScrollArea.Viewport, ($$anchor, ScrollArea_Viewport) => {
						ScrollArea_Viewport($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.snippet(node_2, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => cn("hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 bg-background before:bg-background relative flex w-2.5 touch-none select-none rounded-full p-px transition-all duration-150 before:absolute before:inset-0 hover:w-3", $$props.scrollbarYProps?.class));

							$.component(node_4, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar) => {
								ScrollArea_Scrollbar($$anchor, $.spread_props({ orientation: 'vertical' }, () => $$props.scrollbarYProps, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb) => {
											ScrollArea_Thumb($$anchor, { class: 'bg-muted-foreground flex-1 rounded-full' });
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_3, ($$render) => {
						if (orientation() === "vertical" || orientation() === "both") $$render(consequent);
					});
				}

				var node_6 = $.sibling(node_3, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_7 = $.first_child(fragment_5);

						{
							let $0 = $.derived(() => cn("hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 bg-background before:bg-background relative flex h-2.5 touch-none select-none rounded-full p-px transition-all duration-150 before:absolute before:inset-0 hover:h-3", $$props.scrollbarXProps?.class));

							$.component(node_7, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar_1) => {
								ScrollArea_Scrollbar_1($$anchor, $.spread_props({ orientation: 'horizontal' }, () => $$props.scrollbarXProps, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb_1) => {
											ScrollArea_Thumb_1($$anchor, { class: 'bg-muted-foreground rounded-full' });
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								}));
							});
						}

						$.append($$anchor, fragment_5);
					};

					$.if(node_6, ($$render) => {
						if (orientation() === "horizontal" || orientation() === "both") $$render(consequent_1);
					});
				}

				var node_9 = $.sibling(node_6, 2);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_7 = $.comment();
						var node_10 = $.first_child(fragment_7);

						$.component(node_10, () => ScrollArea.Corner, ($$anchor, ScrollArea_Corner) => {
							ScrollArea_Corner($$anchor, {});
						});

						$.append($$anchor, fragment_7);
					};

					$.if(node_9, ($$render) => {
						if (orientation() === "both") $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}