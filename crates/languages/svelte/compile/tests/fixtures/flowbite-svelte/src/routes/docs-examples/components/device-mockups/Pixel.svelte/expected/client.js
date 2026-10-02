import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/blocks/marketing-ui/hero/mockup-1-light.png" class="h-[572px] w-[272px] dark:hidden" alt="android example 1"/> <img src="/images/blocks/marketing-ui/hero/mockup-1-dark.png" class="hidden h-[572px] w-[272px] dark:block" alt="android example 2"/>`, 1);

export default function Pixel($$anchor) {
	DeviceMockup($$anchor, {
		device: 'android',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}