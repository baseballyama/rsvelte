import * as $ from 'svelte/internal/server';
import { DeviceMockup } from "flowbite-svelte";

export default function Laptop($$renderer) {
	DeviceMockup($$renderer, {
		device: 'laptop',
		children: ($$renderer) => {
			$$renderer.push(`<img src="/images/docs/device-mockups/laptop-screen.png" class="h-[156px] w-full rounded-xl md:h-[278px] dark:hidden" alt="laptop example 1"/> <img src="/images/docs/device-mockups/laptop-screen-dark.png" class="hidden h-[156px] w-full rounded-lg md:h-[278px] dark:block" alt="laptop example 2"/>`);
		},
		$$slots: { default: true }
	});
}