import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { activeElement } from "runed";
import { DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<p>Currently active element: <code class="font-bold"> </code></p>`);

export default function Active_element($$anchor, $$props) {
	$.push($$props, true);

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var code = $.sibling($.child(p));
			var text = $.only_child(code, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, activeElement.current?.localName ?? "No active element found"));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.pop();
}