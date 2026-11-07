import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/docs/device-mockups/laptop-screen.png" class="h-[156px] w-full rounded-xl md:h-[278px] dark:hidden" alt="laptop example 1"/> <img src="/images/docs/device-mockups/laptop-screen-dark.png" class="hidden h-[156px] w-full rounded-lg md:h-[278px] dark:block" alt="laptop example 2"/>`, 1);

export default function Laptop($$anchor) {
	DeviceMockup($$anchor, {
		device: 'laptop',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}