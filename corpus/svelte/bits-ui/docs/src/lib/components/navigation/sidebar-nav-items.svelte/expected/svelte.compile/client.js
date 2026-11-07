import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { cn } from "$lib/utils/styles.js";

var root = $.from_html(`<span class="ml-2 rounded-[4px] bg-[#FCDAFE] px-1.5 py-1 text-[0.7rem] font-semibold leading-none text-[#2A266B] no-underline group-hover:no-underline"> </span>`);
var root_1 = $.from_html(`<a> <!></a>`);
var root_2 = $.from_html(`<span class="text-muted-foreground flex w-full cursor-not-allowed items-center rounded-md px-2.5 py-1.5 text-sm hover:underline"> </span>`);
var root_3 = $.from_html(`<div class="grid grid-flow-row auto-rows-max gap-[1px] pl-4 text-sm"></div>`);

export default function Sidebar_nav_items($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_3();

			$.each(div, 21, items, $.index, ($$anchor, item) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var a = root_1();
						var text = $.child(a);
						var node_2 = $.sibling(text);

						{
							var consequent = ($$anchor) => {
								var span = root();
								var text_1 = $.only_child(span, true);

								$.template_effect(() => $.set_text(text_1, $.get(item).label));
								$.append($$anchor, span);
							};

							$.if(node_2, ($$render) => {
								if ($.get(item).label) $$render(consequent);
							});
						}

						$.reset(a);

						$.template_effect(
							($0) => {
								$.set_attribute(a, 'href', $.get(item).href);
								$.set_class(a, 1, $0);
								$.set_attribute(a, 'target', $.get(item).external ? "_blank" : "");
								$.set_attribute(a, 'rel', $.get(item).external ? "noreferrer" : "");
								$.set_text(text, `${$.get(item).title ?? ''} `);
							},
							[
								() => $.clsx(cn("text-foreground focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex w-full items-center rounded-md px-2.5 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2", $.get(item).disabled && "cursor-not-allowed opacity-60 ", page.url.pathname === $.get(item).href ? "bg-muted" : "hover:bg-muted/50"))
							]
						);

						$.append($$anchor, a);
					};

					var alternate = ($$anchor) => {
						var span_1 = root_2();
						var text_2 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_2, $.get(item).title));
						$.append($$anchor, span_1);
					};

					$.if(node_1, ($$render) => {
						if ($.get(item).href) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (items().length) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}