import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import Toc from "$lib/components/base/toc/toc.svelte";
import { docsV2Pages } from "$lib/config/docs-v2";
import DocsSidebar from "$lib/components/layout/DocsSidebar.svelte";
import { ScrollArea } from "$lib/components/ui/scroll-area";
import { setDocsLayoutContext } from "$lib/components/layout/docs-layout-context";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { UseToc } from "$lib/hooks/use-toc.svelte";
import { cn } from "$lib/utils";

var root = $.from_html(`<aside class="sticky top-20 hidden lg:block"><div class="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm"><p class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="14" y1="12" y2="12"></line><line x1="4" x2="10" y1="18" y2="18"></line></svg> On this page</p> <!></div></aside>`);
var root_1 = $.from_html(`<!> <div class="grid w-full grid-cols-1 md:grid-cols-8 md:gap-x-6 md:px-6"><div class="py-6 md:col-span-6"><!></div> <div class="md:col-span-2"><!></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let docContentRef = $.state(void 0);
	const toc = new UseToc();

	setDocsLayoutContext({
		registerDocContent: (el) => {
			$.set(docContentRef, el, true);
		}
	});

	const normalizePath = (value) => value === "/" ? value : value.replace(/\/+$/, "");

	const currentPageMeta = $.derived(() => {
		const currentPath = normalizePath(page.url.pathname);

		return docsV2Pages.find((item) => normalizePath(item.path) === currentPath);
	});

	const showToc = $.derived(() => $.get(currentPageMeta)?.toc ?? true);

	$.user_effect(() => {
		toc.ref = $.get(docContentRef);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				DocsSidebar(node_1, {});

				var div = $.sibling(node_1, 2);
				var div_1 = $.child(div);
				var node_2 = $.child(div_1);

				$.snippet(node_2, () => $$props.children);
				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_3 = $.child(div_2);

				{
					var consequent = ($$anchor) => {
						var aside = root();
						var div_3 = $.child(aside);
						var node_4 = $.sibling($.child(div_3), 2);

						Toc(node_4, {
							get toc() {
								return toc.current;
							}
						});

						$.reset(div_3);
						$.reset(aside);
						$.append($$anchor, aside);
					};

					$.if(node_3, ($$render) => {
						if ($.get(showToc)) $$render(consequent);
					});
				}

				$.reset(div_2);
				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}