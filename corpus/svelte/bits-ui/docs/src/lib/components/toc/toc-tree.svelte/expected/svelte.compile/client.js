import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";
import Tree from "./toc-tree.svelte";

var root = $.from_html(`<li><a> </a> <!></li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function Toc_tree($$anchor, $$props) {
	$.push($$props, true);

	let level = $.prop($$props, 'level', 3, 1);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var ul = root_1();

			$.each(ul, 21, () => $$props.tree.items, $.index, ($$anchor, item) => {
				const isActive = $.derived(() => $$props.activeUrl === $.get(item).url);
				var li = root();
				var a = $.child(li);
				var text = $.only_child(a, true);
				var node_1 = $.sibling(a, 2);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => level() + 1);

							Tree($$anchor, {
								get tree() {
									return $.get(item);
								},

								get level() {
									return $.get($0);
								},

								get activeUrl() {
									return $$props.activeUrl;
								}
							});
						}
					};

					$.if(node_1, ($$render) => {
						if ($.get(item).items?.length) $$render(consequent);
					});
				}

				$.reset(li);

				$.template_effect(
					($0, $1) => {
						$.set_class(li, 1, $0);
						$.set_attribute(a, 'aria-current', $.get(isActive) ? "location" : undefined);
						$.set_attribute(a, 'href', $.get(item).url);
						$.set_class(a, 1, $1);
						$.set_text(text, $.get(item).title);
					},
					[
						() => $.clsx(cn("mt-0")),
						() => $.clsx(cn(
							"hover:text-foreground inline-block border-l border-l-transparent py-[5px] pl-5 leading-4 no-underline",
							$.get(isActive)
								? "text-foreground border-l-foreground"
								: "text-muted-foreground border-l-transparent",
							level() !== 1 && "-ml-4 pl-10"
						))
					]
				);

				$.append($$anchor, li);
			});

			$.reset(ul);

			$.template_effect(($0) => $.set_class(ul, 1, $0), [
				() => $.clsx(cn("m-0 list-none", {
					"pl-4": level() !== 1,
					"border-border/50 border-l": level() === 1
				}))
			]);

			$.append($$anchor, ul);
		};

		$.if(node, ($$render) => {
			if ($$props.tree?.items?.length && level() < 3) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}