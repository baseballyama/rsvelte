import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Smartwatch($$renderer) {
	DeviceMockup($$renderer, {
		device: 'smartwatch',
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/docs/device-mockups/watch-screen-image.png" class="h-[193px] w-[188px] dark:hidden" alt="smartwatch example 1"/> <img src="/images/docs/device-mockups/watch-screen-image-dark.png" class="hidden h-[193px] w-[188px] dark:block" alt="smartwatch example 2"/>`);
		},
		$$slots: { default: true }
	});
}