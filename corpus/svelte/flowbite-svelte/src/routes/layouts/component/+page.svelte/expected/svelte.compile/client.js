import 'svelte/internal/disclose-version';
import code from "./code.svelte";
import h2 from "./h2.svelte";
import h3 from "./h3.svelte";
import * as $ from 'svelte/internal/client';
import Footer from "../../utils/Footer.svelte";
import MetaTag from "../../utils/MetaTag.svelte";
import Newsletter from "../../utils/Newsletter.svelte";
import PageHeadSection from "../../utils/PageHeadSection.svelte";
import Paging from "../../utils/Paging.svelte";
import SectionHeader from "../../blocks/utils/SectionHeader.svelte";

export { code, h2, h3 };

var root = $.from_html(`<div><!> <div id="mainContent"><!> <!></div></div>`);
var root_1 = $.from_html(`<div class="flex w-full"><div><!> <div id="mainContent" class="py-8"><!> <!></div> <!> <!></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let component_title = $.prop($$props, 'component_title', 3, ""),
		layout = $.prop($$props, 'layout', 3, ""),
		pkg = $.prop($$props, 'pkg', 3, "Flowbite Svelte");

	// calm down `unused export property` warning - use them in $effect
	$.user_effect(() => {
		/* eslint-disable @typescript-eslint/no-unused-expressions */
		layout();

		component_title();
	});

	const blockDirs = new Set(["application", "marketing", "publisher", "quickstart"]);
	const pageWidth = $.derived(() => blockDirs.has($$props.dir) ? "max-w-8xl" : "max-w-4xl");

	let divClass = $.derived(() => $$props.category
		? ""
		: "mx-auto max-w-8xl lg:px-20 px-8 md:px-auto py-8");

	var fragment = root_2();
	var node = $.first_child(fragment);

	MetaTag(node, {
		get breadcrumb_title() {
			return $$props.breadcrumb_title;
		},

		get title() {
			return $$props.title;
		},

		get dir() {
			return $$props.dir;
		},

		get description() {
			return $$props.description;
		},

		get pkg() {
			return pkg();
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_2 = $.child(div);

			SectionHeader(node_2, {
				get category() {
					return $$props.dir;
				},

				get breadcrumb_title() {
					return $$props.breadcrumb_title;
				},

				get title() {
					return $$props.title;
				},

				get description() {
					return $$props.description;
				}
			});

			var div_1 = $.sibling(node_2, 2);
			var node_3 = $.child(div_1);

			$.snippet(node_3, () => $$props.children);

			var node_4 = $.sibling(node_3, 2);

			Paging(node_4, {});
			$.reset(div_1);
			$.reset(div);
			$.template_effect(() => $.set_class(div, 1, $.clsx($.get(divClass))));
			$.append($$anchor, div);
		};

		var d = $.derived(() => blockDirs.has($$props.dir));

		var alternate = ($$anchor) => {
			var div_2 = root_1();
			var div_3 = $.child(div_2);
			var node_5 = $.child(div_3);

			PageHeadSection(node_5, {
				get title() {
					return $$props.title;
				},

				get description() {
					return $$props.description;
				}
			});

			var div_4 = $.sibling(node_5, 2);
			var node_6 = $.child(div_4);

			$.snippet(node_6, () => $$props.children);

			var node_7 = $.sibling(node_6, 2);

			Paging(node_7, {});
			$.reset(div_4);

			var node_8 = $.sibling(div_4, 2);

			Newsletter(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			Footer(node_9, {});
			$.reset(div_3);
			$.reset(div_2);
			$.template_effect(() => $.set_class(div_3, 1, `pb:12 mx-auto flex min-w-0 flex-col px-4 pt-6 lg:px-8 lg:pt-8 lg:pb-16 xl:pb-24 ${$.get(pageWidth) ?? ''}`));
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}