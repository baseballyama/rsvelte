import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { cn } from "$lib/utils/styles.js";
import Metadata from "./metadata.svelte";
import Toc from "./toc/toc.svelte";
import DocPageHeader from "./doc-page-header.svelte";
import SidebarSponsor from "./sidebar-sponsor.svelte";
import DocsPager from "./docs-pager.svelte";

var root = $.from_html(`<aside class="order-2 hidden text-sm xl:block"><div class="sticky top-[var(--header-height)] -mt-16 flex h-[calc(100vh-var(--header-height))] flex-col gap-4 overflow-hidden pt-6"><!> <!></div></aside>`);
var root_1 = $.from_html(`<!> <div><!> <div class="order-1 mx-auto w-full min-w-0 md:max-w-[760px]"><main class="markdown pb-24" id="main-content"><!> <!> <!></main></div></div>`, 1);

export default function Doc_page($$anchor, $$props) {
	$.push($$props, true);

	let schemas = $.prop($$props, 'schemas', 19, () => []);
	const PageComponent = $.derived(() => $$props.component);

	const apiSchemaToc = $.derived(() => {
		if (!schemas().length) return null;

		return {
			title: "API Reference",
			url: "#api-reference",
			items: schemas().map((schema) => ({ title: schema.title, url: `#${schema.title.toLowerCase()}` }))
		};
	});

	const fullToc = $.derived(() => $.get(apiSchemaToc)
		? [...$$props.metadata.toc, $.get(apiSchemaToc)]
		: $$props.metadata.toc);

	var fragment = root_1();
	var node = $.first_child(fragment);

	Metadata(node, $.spread_props(() => $$props.metadata));

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var aside = root();
			var div_1 = $.child(aside);
			var node_2 = $.child(div_1);

			$.key(node_2, () => $$props.metadata.title, ($$anchor) => {
				{
					let $0 = $.derived(() => ({ items: $.get(fullToc) }));

					Toc($$anchor, {
						get toc() {
							return $.get($0);
						}
					});
				}
			});

			var node_3 = $.sibling(node_2, 2);

			SidebarSponsor(node_3, {});
			$.reset(div_1);
			$.reset(aside);
			$.append($$anchor, aside);
		};

		$.if(node_1, ($$render) => {
			if (!page.error) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node_1, 2);
	var main = $.child(div_2);
	var node_4 = $.child(main);

	DocPageHeader(node_4, {
		get metadata() {
			return $$props.metadata;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => $.get(PageComponent), ($$anchor, PageComponent_1) => {
		PageComponent_1($$anchor, {
			get schemas() {
				return schemas();
			}
		});
	});

	var node_6 = $.sibling(node_5, 2);

	DocsPager(node_6, {});
	$.reset(main);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn("relative flex flex-row-reverse pl-4 pr-4 pt-8 sm:pt-16 md:pl-0 lg:gap-10 xl:grid-cols-[1fr_220px]", page.error ?? "xl:grid"))
	]);

	$.append($$anchor, fragment);
	$.pop();
}