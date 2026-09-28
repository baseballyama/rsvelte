import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Tablet($$renderer) {
	DeviceMockup($$renderer, {
		device: 'tablet',
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/docs/device-mockups/tablet-mockup-image.png" class="h-[426px] md:h-[654px] dark:hidden" alt="tablet example 1"/> <img src="/images/docs/device-mockups/tablet-mockup-image-dark.png" class="hidden h-[426px] md:h-[654px] dark:block" alt="tablet example 2"/>`);
		},
		$$slots: { default: true }
	});
}