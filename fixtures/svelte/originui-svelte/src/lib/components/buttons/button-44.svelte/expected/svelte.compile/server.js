import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

export default function Button_44($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-2">`);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			RiGoogleFill($$renderer, {
				class: 'me-1 text-[#DB4437] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> Login with Google`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			RiTwitterXFill($$renderer, {
				class: 'me-1 text-[#14171a] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> Login with X`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			RiFacebookFill($$renderer, {
				class: 'me-1 text-[#1877f2] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> Login with Facebook`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			RiGithubFill($$renderer, {
				class: 'me-1 text-[#333333] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----> Login with GitHub`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}