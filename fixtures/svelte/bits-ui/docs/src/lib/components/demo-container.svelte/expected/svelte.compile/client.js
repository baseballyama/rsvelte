import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";
import OpenInStackblitz from "./open-in-stackblitz.svelte";

var root = $.from_html(`<div data-llm-ignore=""><div><!></div> <!></div>`);

export default function Demo_container($$anchor, $$props) {
	$.push($$props, true);

	let align = $.prop($$props, 'align', 3, "center"),
		size = $.prop($$props, 'size', 3, "default"),
		componentName = $.prop($$props, 'componentName', 19, () => $$props.name);

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			OpenInStackblitz($$anchor, {
				get demoName() {
					return $$props.name;
				},

				get componentName() {
					return componentName();
				}
			});
		};

		$.if(node_1, ($$render) => {
			if ($$props.name) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
		},
		[
			() => $.clsx(cn("rounded-tl-card rounded-tr-card border-muted ring-transparent! relative mt-6 border-2 bg-zinc-50 dark:bg-neutral-900/50", $$props.wrapperClass)),
			() => $.clsx(cn(
				"preview flex w-full justify-center p-12",
				{
					"items-center": align() === "center",
					"items-start": align() === "start",
					"items-end": align() === "end",
					"min-h-[443px]": size() === "default",
					"min-h-[200px]": size() === "xs",
					"min-h-[300px]": size() === "sm",
					"min-h-[600px]": size() === "lg"
				},
				$$props.class
			))
		]
	);

	$.append($$anchor, div);
	$.pop();
}