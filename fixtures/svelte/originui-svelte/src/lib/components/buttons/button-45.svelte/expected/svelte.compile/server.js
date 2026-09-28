import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

export default function Button_45($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-2">`);

	Button($$renderer, {
		class: 'bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90',
		children: ($$renderer) => {
			$$renderer.push(`<span class="pointer-events-none me-2 flex-1">`);

			RiGoogleFill($$renderer, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----></span> Login with Google`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'bg-[#14171a] text-white after:flex-1 hover:bg-[#14171a]/90',
		children: ($$renderer) => {
			$$renderer.push(`<span class="pointer-events-none me-2 flex-1">`);

			RiTwitterXFill($$renderer, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----></span> Login with X`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'bg-[#1877f2] text-white after:flex-1 hover:bg-[#1877f2]/90',
		children: ($$renderer) => {
			$$renderer.push(`<span class="pointer-events-none me-2 flex-1">`);

			RiFacebookFill($$renderer, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----></span> Login with Facebook`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'bg-[#333333] text-white after:flex-1 hover:bg-[#333333]/90',
		children: ($$renderer) => {
			$$renderer.push(`<span class="pointer-events-none me-2 flex-1">`);

			RiGithubFill($$renderer, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----></span> Login with GitHub`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}