import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flatNavigation } from "$lib/config/navigation.js";
import { page } from "$app/state";
import { cn } from "$lib/utils/styles.js";
import { Separator } from "bits-ui";

var root = $.from_html(`<a><span class="text-muted-foreground flex items-center gap-1 text-xs font-medium">Previous</span> <span class="text-foreground font-medium"> </span></a>`);
var root_1 = $.from_html(`<a><span class="text-muted-foreground flex items-center justify-end gap-1 text-xs font-medium">Next</span> <span class="text-foreground font-medium"> </span></a>`);
var root_2 = $.from_html(`<!> <div class="flex flex-col gap-4 pt-1"><div class="grid grid-cols-2 gap-4"><!> <!></div></div>`, 1);

export default function Docs_pager($$anchor, $$props) {
	$.push($$props, true);

	const previous = $.derived(() => flatNavigation[flatNavigation.findIndex((item) => item.href === page.url.pathname) - 1]);
	const next = $.derived(() => flatNavigation[flatNavigation.findIndex((item) => item.href === page.url.pathname) + 1]);
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => Separator.Root, ($$anchor, Separator_Root) => {
		Separator_Root($$anchor, { class: 'bg-border my-6 h-px' });
	});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var span = $.sibling($.child(a), 2);
			var text = $.only_child(span, true);

			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', $.get(previous).href);
					$.set_class(a, 1, $0);
					$.set_text(text, $.get(previous).title);
				},
				[
					() => $.clsx(cn("hover:bg-muted/50 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden group flex flex-col gap-2 rounded-[7px] border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"))
				]
			);

			$.append($$anchor, a);
		};

		$.if(node_1, ($$render) => {
			if ($.get(previous)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_1();
			var span_1 = $.sibling($.child(a_1), 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(a_1);

			$.template_effect(
				($0) => {
					$.set_attribute(a_1, 'href', $.get(next).href);
					$.set_class(a_1, 1, $0);
					$.set_text(text_1, $.get(next).title);
				},
				[
					() => $.clsx(cn("hover:bg-muted/50 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden group col-start-2 flex flex-col gap-2 rounded-[7px] border p-4 text-right transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"))
				]
			);

			$.append($$anchor, a_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(next)) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}