import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<div><span class="absolute -left-4 flex size-8 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-medium text-foreground [counter-increment:step] before:content-[counter(step)]"></span> <h3 class="text-base leading-none font-medium"> </h3></div>`);
var root_1 = $.from_html(`<span class="absolute top-1 -left-4 flex size-8 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-medium text-foreground [counter-increment:step] before:content-[counter(step)]"></span>`);
var root_2 = $.from_html(`<div><!> <div class="text-base leading-relaxed text-foreground/70"><!></div></div>`);

export default function Step($$anchor, $$props) {
	$.push($$props, true);

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var h3 = $.sibling($.child(div_1), 2);
			var text = $.only_child(h3, true);

			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_class(div_1, 1, $0);
					$.set_text(text, $$props.title);
				},
				[
					() => $.clsx(cn("mb-2 flex h-8 items-center", $$props.titleBaseClass))
				]
			);

			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var span = root_1();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.title) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("relative pb-10 pl-8", $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}