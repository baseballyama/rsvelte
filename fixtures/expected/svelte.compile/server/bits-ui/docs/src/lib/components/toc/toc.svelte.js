import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import TocTree from "./toc-tree.svelte";
import { ScrollArea } from "bits-ui";
import List from "phosphor-svelte/lib/List";

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toc } = $$props;
		let activeUrl = null;

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

				activeUrl = firstVisibleSection[1];
			};

			const observer = new IntersectionObserver(callback, { rootMargin: "-70px 0px" });

			Array.from(sections.keys()).forEach((element) => observer.observe(element));

			return () => observer.disconnect();
		});

		if (ScrollArea.Root) {
			$$renderer.push('<!--[-->');

			ScrollArea.Root($$renderer, {
				children: ($$renderer) => {
					if (ScrollArea.Viewport) {
						$$renderer.push('<!--[-->');

						ScrollArea.Viewport($$renderer, {
							class: 'max-h-[calc(100vh-300px)]',
							children: ($$renderer) => {
								if (toc?.items?.length) {
									$$renderer.push(`<!--[0--><div class="w-[220px] max-w-[220px] space-y-2 text-sm"><div class="text-muted-foreground -ml-px flex items-center gap-1.5">`);
									List($$renderer, { class: 'size-4 shrink-0' });
									$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">On this page</p></div> <div class="relative mt-4">`);
									TocTree($$renderer, { tree: toc, activeUrl });
									$$renderer.push(`<!----></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (ScrollArea.Scrollbar) {
						$$renderer.push('<!--[-->');

						ScrollArea.Scrollbar($$renderer, {
							orientation: 'vertical',
							class: 'hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent bg-transparent p-px transition-all duration-200 hover:w-3',
							children: ($$renderer) => {
								if (ScrollArea.Thumb) {
									$$renderer.push('<!--[-->');
									ScrollArea.Thumb($$renderer, { class: 'bg-muted-foreground flex-1 rounded-full' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (ScrollArea.Corner) {
						$$renderer.push('<!--[-->');
						ScrollArea.Corner($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}