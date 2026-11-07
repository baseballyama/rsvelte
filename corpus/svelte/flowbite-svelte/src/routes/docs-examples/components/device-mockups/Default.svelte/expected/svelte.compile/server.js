import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Default($$renderer) {
	DeviceMockup($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/blocks/marketing-ui/hero/mockup-1-light.png" class="h-[572px] w-[272px] dark:hidden" alt="default example 1"/> <img src="/images/blocks/marketing-ui/hero/mockup-1-dark.png" class="hidden h-[572px] w-[272px] dark:block" alt="default example 2"/>`);
		},
		$$slots: { default: true }
	});
}