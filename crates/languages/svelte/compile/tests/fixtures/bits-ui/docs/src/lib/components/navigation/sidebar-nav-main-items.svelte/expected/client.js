import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { cn } from "$lib/utils/styles.js";

var root = $.from_html(`<span class="rounded-[4px] bg-[#FCDAFE] px-1.5 py-1 text-xs font-semibold leading-none text-[#2A266B] no-underline group-hover:no-underline"> </span>`);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_html(`<div class="grid grid-flow-row auto-rows-max gap-0.5 pb-8 pl-4 text-sm"></div>`);

export default function Sidebar_nav_main_items($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_2();

			$.each(div, 21, items, $.index, ($$anchor, item) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						const Icon = $.derived(() => $.get(item).icon);
						var a = root_1();
						var node_2 = $.child(a);

						$.component(node_2, () => $.get(Icon), ($$anchor, Icon_1) => {
							Icon_1($$anchor, { size: 22 });
						});

						var text = $.sibling(node_2);
						var node_3 = $.sibling(text);

						{
							var consequent = ($$anchor) => {
								var span = root();
								var text_1 = $.only_child(span, true);

								$.template_effect(() => $.set_text(text_1, $.get(item).label));
								$.append($$anchor, span);
							};

							$.if(node_3, ($$render) => {
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
								$.set_text(text, ` ${$.get(item).title ?? ''} `);
							},
							[
								() => $.clsx(cn("text-foreground focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2", page.url.pathname === $.get(item).href ? "bg-muted" : "hover:bg-muted/50 bg-transparent"))
							]
						);

						$.append($$anchor, a);
					};

					$.if(node_1, ($$render) => {
						if ($.get(item).href) $$render(consequent_1);
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