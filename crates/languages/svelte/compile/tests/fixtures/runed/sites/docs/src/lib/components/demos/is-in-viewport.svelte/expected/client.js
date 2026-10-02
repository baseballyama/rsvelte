import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IsInViewport } from "runed";
import { DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<p>Target node</p> <p class="text-muted-foreground text-sm italic">Scroll down to observe the behavior</p>`, 1);
var root_1 = $.from_html(`<!> <div class="bg-background fixed bottom-8 right-8 z-20 flex items-center rounded-lg border p-4 text-sm"><p>Target node is <span class="font-medium text-red-500 data-[in-viewport]:text-green-500"> </span> viewport</p></div>`, 1);

export default function Is_in_viewport($$anchor, $$props) {
	$.push($$props, true);

	let targetNode = $.state(void 0);
	const inViewport = new IsInViewport(() => $.get(targetNode));
	var fragment = root_1();
	var node = $.first_child(fragment);

	DemoContainer(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);

			$.bind_this(p, ($$value) => $.set(targetNode, $$value), () => $.get(targetNode));
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var p_1 = $.child(div);
	var span = $.sibling($.child(p_1));
	var text = $.only_child(span, true);

	$.next();
	$.reset(p_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(span, 'data-in-viewport', inViewport.current ? "" : undefined);
		$.set_text(text, inViewport.current ? " in " : " out of ");
	});

	$.append($$anchor, fragment);
	$.pop();
}