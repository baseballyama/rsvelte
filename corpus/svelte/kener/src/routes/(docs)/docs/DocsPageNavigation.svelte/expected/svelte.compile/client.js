import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from "$app/paths";
import ChevronLeft from "@lucide/svelte/icons/chevron-left";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`<a class=" text-foreground hover:bg-accent flex items-center justify-start gap-3 rounded p-4 no-underline transition-all duration-200"><!> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs tracking-wide uppercase">Previous</span> <span class="text-[0.9375rem] font-medium"> </span></div></a>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<a class="text-foreground hover:bg-accent flex items-center justify-end gap-3 rounded p-4 text-right no-underline transition-all duration-200"><div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs tracking-wide uppercase">Next</span> <span class="text-[0.9375rem] font-medium"> </span></div> <!></a>`);
var root_3 = $.from_html(`<nav class="border-border mt-16 border-t pt-8"><div class="grid grid-cols-2 gap-4"><!> <!></div></nav>`);

export default function DocsPageNavigation($$anchor, $$props) {
	$.push($$props, true);

	function getHref(slug) {
		return `${base}/docs/${slug}`;
	}

	var nav = root_3();
	var div = $.child(nav);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var node_1 = $.child(a);

			ChevronLeft(node_1, { class: 'h-4 w-4' });

			var div_1 = $.sibling(node_1, 2);
			var span = $.sibling($.child(div_1), 2);
			var text = $.only_child(span, true);

			$.reset(div_1);
			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', $0);
					$.set_text(text, $$props.prevPage.title);
				},
				[() => getHref($$props.prevPage.slug)]
			);

			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.prevPage) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_2();
			var div_3 = $.child(a_1);
			var span_1 = $.sibling($.child(div_3), 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_3);

			var node_3 = $.sibling(div_3, 2);

			ChevronRight(node_3, { class: 'h-4 w-4' });
			$.reset(a_1);

			$.template_effect(
				($0) => {
					$.set_attribute(a_1, 'href', $0);
					$.set_text(text_1, $$props.nextPage.title);
				},
				[() => getHref($$props.nextPage.slug)]
			);

			$.append($$anchor, a_1);
		};

		var alternate_1 = ($$anchor) => {
			var div_4 = root_1();

			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($$props.nextPage) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}