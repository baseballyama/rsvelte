import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useResizeObserver } from "runed";
import { Textarea, DemoContainer } from "@svecodocs/kit";

export default function Use_resize_observer($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(null);
	let text = $.state("");

	useResizeObserver(() => $.get(ref), (entries) => {
		const entry = entries[0];

		if (!entry) return;

		const { width, height } = entry.contentRect;

		$.set(text, `width: ${width}\nheight: ${height}`);
	});

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, {
				readonly: true,
				get value() {
					return $.get(text);
				},
				class: 'h-[200px] min-h-[100px] w-[300px]  resize text-base',
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