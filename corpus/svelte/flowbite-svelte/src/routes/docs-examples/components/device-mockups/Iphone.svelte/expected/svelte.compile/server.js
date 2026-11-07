import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Iphone($$renderer) {
	DeviceMockup($$renderer, {
		device: 'ios',
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/blocks/marketing-ui/hero/mockup-2-light.png" class="h-[572px] w-[272px] dark:hidden" alt="ios example 1"/> <img src="/images/blocks/marketing-ui/hero/mockup-2-dark.png" class="hidden h-[572px] w-[272px] dark:block" alt="ios example 2"/>`);
		},
		$$slots: { default: true }
	});
}