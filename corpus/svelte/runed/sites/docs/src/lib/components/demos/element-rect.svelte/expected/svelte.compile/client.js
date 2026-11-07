import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ElementRect } from "runed";
import { DemoContainer, Textarea } from "@svecodocs/kit";

export default function Element_rect($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(null);
	const rect = new ElementRect(() => $.get(ref));
	const text = $.derived(() => Object.entries(rect.current).map(([key, value]) => `${key}: ${value}`).join("\n"));

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, {
				class: 'h-[330px] min-h-[300px] w-[300px] resize text-base',
				get value() {
					return $.get(text);
				},
				readonly: true,
				get ref() {
					return $.get(ref);
				},

				set ref($$value) {
					$.set(ref, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}