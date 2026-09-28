import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useEventListener } from "runed";
import { DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<p> </p>`);

export default function Use_event_listener($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	useEventListener(() => document.body, "click", () => $.update(count));

	DemoContainer($$anchor, {
		class: 'select-none',
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `You've clicked the document ${$.get(count) ?? ''} ${$.get(count) === 1 ? "time" : "times"}`));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.pop();
}