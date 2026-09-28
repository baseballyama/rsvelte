import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/docs/device-mockups/screen-image-imac.png" class="h-[140px] w-full rounded-xl md:h-[262px] dark:hidden" alt="desktop example 1"/> <img src="/images/docs/device-mockups/screen-image-imac-dark.png" class="hidden h-[140px] w-full rounded-xl md:h-[262px] dark:block" alt="desktop example 2"/>`, 1);

export default function Desktop($$anchor) {
	DeviceMockup($$anchor, {
		device: 'desktop',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}