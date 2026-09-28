import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import TocTree from "./toc-tree.svelte";
import { ScrollArea } from "bits-ui";
import List from "phosphor-svelte/lib/List";

var root_1 = $.from_html(`<div class="w-[220px] max-w-[220px] space-y-2 text-sm"><div class="text-muted-foreground -ml-px flex items-center gap-1.5"><!> <p class="text-muted-foreground text-sm">On this page</p></div> <div class="relative mt-4"><!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Toc($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.state(null);

	onMount(() => {
		const root = document.getElementById("main-content");

		if (!root) return;

		let elements = root.querySelectorAll("h2, h3");
		let sections = new Map();
		let currentSectionId = null;

		for (let element of elements) {
			if (element.id && (element.tagName === "H2" || element.tagName === "H3")) currentSectionId = element.id;
			if (!currentSectionId) continue;

			sections.set(element, `#${currentSectionId}`);
		}

		let visibleElements = new Set();

		const callback = (entries) => {
			for (let entry of entries) {
				if (entry.isIntersecting) {
					visibleElements.add(entry.target);
				} else {
					visibleElements.delete(entry.target);
				}
			}

			let firstVisibleSection = Array.from(sections.entries()).find(([element]) => visibleElements.has(element));

			if (!firstVisibleSection) return;

			$.set(activeUrl, firstVisibleSection[1], true);
		};

		const observer = new IntersectionObserver(callback, { rootMargin: "-70px 0px" });

		Array.from(sections.keys()).forEach((element) => observer.observe(element));

		return () => observer.disconnect();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
		ScrollArea_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ScrollArea.Viewport, ($$anchor, ScrollArea_Viewport) => {
					ScrollArea_Viewport($$anchor, {
						class: 'max-h-[calc(100vh-300px)]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var div = root_1();
									var div_1 = $.child(div);
									var node_3 = $.child(div_1);

									List(node_3, { class: 'size-4 shrink-0' });
									$.next(2);
									$.reset(div_1);

									var div_2 = $.sibling(div_1, 2);
									var node_4 = $.child(div_2);

									TocTree(node_4, {
										get tree() {
											return $$props.toc;
										},

										get activeUrl() {
											return $.get(activeUrl);
										}
									});

									$.reset(div_2);
									$.reset(div);
									$.append($$anchor, div);
								};

								$.if(node_2, ($$render) => {
									if ($$props.toc?.items?.length) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar) => {
					ScrollArea_Scrollbar($$anchor, {
						orientation: 'vertical',
						class: 'hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent bg-transparent p-px transition-all duration-200 hover:w-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb) => {
								ScrollArea_Thumb($$anchor, { class: 'bg-muted-foreground flex-1 rounded-full' });
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_5, 2);

				$.component(node_7, () => ScrollArea.Corner, ($$anchor, ScrollArea_Corner) => {
					ScrollArea_Corner($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}