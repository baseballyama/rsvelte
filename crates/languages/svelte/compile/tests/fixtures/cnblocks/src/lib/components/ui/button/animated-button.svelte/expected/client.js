import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'variant',
	'size',
	'ref',
	'href',
	'type',
	'children'
]);

var root = $.from_html(`<a><span><span class="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-md [mask:linear-gradient(white,_transparent_50%)] before:absolute before:[inset:0_auto_auto_50%] before:aspect-square before:w-[200%] before:[translate:-50%_-15%] before:rotate-[-90deg]
        before:animate-kitrotate before:bg-[conic-gradient(from_0deg,transparent_0_330deg,blue_360deg)] before:content-[''] dark:before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)]">,</span></span> <span class="backdrop absolute inset-[0.9px] rounded-md bg-secondary transition-colors duration-200 group-hover:bg-neutral-200 dark:bg-neutral-900 dark:group-hover:bg-neutral-900"></span> <span class="z-10 text-center text-sm font-medium text-primary"><!></span></a>`);

var root_1 = $.from_html(`<button><span><span class="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-md [mask:linear-gradient(white,_transparent_50%)] before:absolute before:[inset:0_auto_auto_50%] before:aspect-square before:w-[200%] before:[translate:-50%_-15%] before:rotate-[-90deg] before:animate-kitrotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-['']"></span></span> <span class="backdrop absolute inset-px rounded-[11px] bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900"></span> <span class="z-10 text-sm font-medium text-neutral-400"><!></span></button>`);

export default function Animated_button($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "default"),
		size = $.prop($$props, 'size', 3, "default"),
		ref = $.prop($$props, 'ref', 11, null),
		href = $.prop($$props, 'href', 3, undefined),
		type = $.prop($$props, 'type', 3, "button"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var span = $.sibling($.child(a), 4);
			var node_1 = $.child(span);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(span);
			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', href());
					$.set_class(a, 1, $0);
				},
				[
					() => $.clsx(cn("group relative grid overflow-hidden rounded-md px-4 py-2 transition-colors duration-200 dark:shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset]", $$props.class))
				]
			);

			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var button = root_1();
			var span_1 = $.sibling($.child(button), 4);
			var node_2 = $.child(span_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(span_1);
			$.reset(button);

			$.template_effect(($0) => $.set_class(button, 1, $0), [
				() => $.clsx(cn("group relative grid overflow-hidden rounded-md px-4 py-2 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200", $$props.class))
			]);

			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (href()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}