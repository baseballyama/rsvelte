import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AnimationFrames, IsIdle } from "runed";
import { DemoContainer } from "@svecodocs/kit";
import DemoNote from "../demo-note.svelte";

var root = $.from_html(`<p>Idle: <span> </span></p> <p>Last active: <span class="font-medium"> </span></p>`, 1);
var root_1 = $.from_html(`<p>By default, the time of inactivity before marking the user as idle is 1 minute.</p> <p>In this demo, it's 1 second.</p>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Is_idle($$anchor, $$props) {
	$.push($$props, true);

	const idle = new IsIdle({ timeout: 1000 });
	let now = $.state($.proxy(Date.now()));

	new AnimationFrames(() => {
		$.set(now, Date.now(), true);
	});

	const secondsElapsed = $.derived(() => Math.floor(($.get(now) - idle.lastActive) / 1000));
	var fragment = root_2();
	var node = $.first_child(fragment);

	DemoContainer(node, {
		class: 'flex flex-col gap-3',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var span = $.sibling($.child(p));
			var text = $.only_child(span, true);

			$.reset(p);

			var p_1 = $.sibling(p, 2);
			var span_1 = $.sibling($.child(p_1));
			var text_1 = $.only_child(span_1);

			$.reset(p_1);

			$.template_effect(() => {
				$.set_class(span, 1, `font-medium ${idle.current
					? 'text-green-600 dark:text-green-500'
					: 'text-destructive'}`);

				$.set_text(text, idle.current);
				$.set_text(text_1, `${$.get(secondsElapsed) ?? ''}s ago`);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	DemoNote(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();

			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}