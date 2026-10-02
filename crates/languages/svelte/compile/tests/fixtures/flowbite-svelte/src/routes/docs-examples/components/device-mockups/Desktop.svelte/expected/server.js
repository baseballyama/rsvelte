import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Desktop($$renderer) {
	DeviceMockup($$renderer, {
		device: 'desktop',
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/docs/device-mockups/screen-image-imac.png" class="h-[140px] w-full rounded-xl md:h-[262px] dark:hidden" alt="desktop example 1"/> <img src="/images/docs/device-mockups/screen-image-imac-dark.png" class="hidden h-[140px] w-full rounded-xl md:h-[262px] dark:block" alt="desktop example 2"/>`);
		},
		$$slots: { default: true }
	});
}