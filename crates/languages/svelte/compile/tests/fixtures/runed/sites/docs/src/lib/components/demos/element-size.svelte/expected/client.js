import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ElementSize } from "runed";
import { DemoContainer, Textarea } from "@svecodocs/kit";

export default function Element_size($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(null);
	const size = new ElementSize(() => $.get(ref));
	const text = $.derived(() => `Width: ${size.width}\nHeight: ${size.height}`);

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, {
				class: 'h-[200px] min-h-[100px] w-[300px] resize text-base',
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