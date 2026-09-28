import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'title',
	'containerClass',
	'class',
	'children'
]);

var root = $.from_html(`<div class="px-1.5 py-2 text-xs font-medium text-muted-foreground"> </div>`);
var root_1 = $.from_html(`<div><!> <div data-slot="example-content"><!></div></div>`);

export default function Example($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_1();

	$.attribute_effect(div, ($0) => ({ 'data-slot': 'example', class: $0, ...restProps }), [
		() => cn("mx-auto flex w-full max-w-lg min-w-0 flex-col gap-1 self-stretch lg:max-w-none", $$props.containerClass)
	]);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.title) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div_2, 1, $0), [
		() => $.clsx(cn("flex min-w-0 flex-1 flex-col items-start gap-6 rounded-xl bg-card p-12 text-foreground *:[div:not([class*='w-'])]:w-full", $$props.class))
	]);

	$.append($$anchor, div);
	$.pop();
}