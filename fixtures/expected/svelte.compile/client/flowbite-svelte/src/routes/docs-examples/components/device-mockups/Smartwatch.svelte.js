import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/docs/device-mockups/watch-screen-image.png" class="h-[193px] w-[188px] dark:hidden" alt="smartwatch example 1"/> <img src="/images/docs/device-mockups/watch-screen-image-dark.png" class="hidden h-[193px] w-[188px] dark:block" alt="smartwatch example 2"/>`, 1);

export default function Smartwatch($$anchor) {
	DeviceMockup($$anchor, {
		device: 'smartwatch',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}