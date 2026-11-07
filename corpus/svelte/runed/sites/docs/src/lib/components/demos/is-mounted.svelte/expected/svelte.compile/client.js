import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IsMounted } from "runed";
import { DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<p>Mounted: <b> </b></p>`);

export default function Is_mounted($$anchor, $$props) {
	$.push($$props, true);

	const isMounted = new IsMounted();

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var b = $.sibling($.child(p));
			var text = $.only_child(b, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, isMounted.current ? "true" : "false"));
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.pop();
}