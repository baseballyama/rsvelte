import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

export default function Button_43($$renderer) {
	$$renderer.push(`<div class="flex flex-wrap gap-2">`);

	Button($$renderer, {
		class: 'flex-1',
		variant: 'outline',
		'aria-label': 'Login with Google',
		size: 'icon',
		children: ($$renderer) => {
			RiGoogleFill($$renderer, {
				class: 'dark:text-primary text-[#DB4437]',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'flex-1',
		variant: 'outline',
		'aria-label': 'Login with Facebook',
		size: 'icon',
		children: ($$renderer) => {
			RiFacebookFill($$renderer, {
				class: 'dark:text-primary text-[#1877f2]',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'flex-1',
		variant: 'outline',
		'aria-label': 'Login with X',
		size: 'icon',
		children: ($$renderer) => {
			RiTwitterXFill($$renderer, {
				class: 'dark:text-primary text-[#14171a]',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'flex-1',
		variant: 'outline',
		'aria-label': 'Login with GitHub',
		size: 'icon',
		children: ($$renderer) => {
			RiGithubFill($$renderer, {
				class: 'dark:text-primary text-black',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}