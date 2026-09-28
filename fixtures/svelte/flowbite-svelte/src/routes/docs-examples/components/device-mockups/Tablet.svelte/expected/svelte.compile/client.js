import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/docs/device-mockups/tablet-mockup-image.png" class="h-[426px] md:h-[654px] dark:hidden" alt="tablet example 1"/> <img src="/images/docs/device-mockups/tablet-mockup-image-dark.png" class="hidden h-[426px] md:h-[654px] dark:block" alt="tablet example 2"/>`, 1);

export default function Tablet($$anchor) {
	DeviceMockup($$anchor, {
		device: 'tablet',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}