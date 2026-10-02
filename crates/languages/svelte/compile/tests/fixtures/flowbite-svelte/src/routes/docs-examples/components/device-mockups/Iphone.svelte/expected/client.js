import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DeviceMockup } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/blocks/marketing-ui/hero/mockup-2-light.png" class="h-[572px] w-[272px] dark:hidden" alt="ios example 1"/> <img src="/images/blocks/marketing-ui/hero/mockup-2-dark.png" class="hidden h-[572px] w-[272px] dark:block" alt="ios example 2"/>`, 1);

export default function Iphone($$anchor) {
	DeviceMockup($$anchor, {
		device: 'ios',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}