import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Pixel($$renderer) {
	DeviceMockup($$renderer, {
		device: 'android',
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/blocks/marketing-ui/hero/mockup-1-light.png" class="h-[572px] w-[272px] dark:hidden" alt="android example 1"/> <img src="/images/blocks/marketing-ui/hero/mockup-1-dark.png" class="hidden h-[572px] w-[272px] dark:block" alt="android example 2"/>`);
		},
		$$slots: { default: true }
	});
}