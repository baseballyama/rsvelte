import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IsDocumentVisible } from "runed";
import { DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<p>Document visible: <b> </b></p> <p>Became visible count: <b> </b></p>`, 1);

export default function Is_document_visible($$anchor, $$props) {
	$.push($$props, true);

	const visible = new IsDocumentVisible();

	// Count how many times visibility transitioned from hidden -> visible
	let becameVisibleCount = $.state(0);

	let last = $.state(undefined);

	$.user_effect(() => {
		const current = visible.current;

		if ($.get(last) !== undefined && $.get(last) === false && current === true) {
			$.update(becameVisibleCount);
		}

		$.set(last, current, true);
	});

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var b = $.sibling($.child(p));
			var text = $.only_child(b, true);

			$.reset(p);

			var p_1 = $.sibling(p, 2);
			var b_1 = $.sibling($.child(p_1));
			var text_1 = $.only_child(b_1, true);

			$.reset(p_1);

			$.template_effect(() => {
				$.set_text(text, visible.current ? "true" : "false");
				$.set_text(text_1, $.get(becameVisibleCount));
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}