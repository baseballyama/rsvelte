import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function LeadingRelaxed($$renderer) {
	P($$renderer, {
		size: '3xl',
		height: 'relaxed',
		class: 'max-w-lg',
		weight: 'semibold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->The Al-powered app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});
}