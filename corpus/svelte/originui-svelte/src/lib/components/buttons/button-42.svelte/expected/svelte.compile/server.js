import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

export default function Button_42($$renderer) {
	$$renderer.push(`<div class="inline-flex flex-wrap gap-2">`);

	Button($$renderer, {
		variant: 'outline',
		'aria-label': 'Login with Google',
		size: 'icon',
		children: ($$renderer) => {
			RiGoogleFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		'aria-label': 'Login with Facebook',
		size: 'icon',
		children: ($$renderer) => {
			RiFacebookFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		'aria-label': 'Login with X',
		size: 'icon',
		children: ($$renderer) => {
			RiTwitterXFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		'aria-label': 'Login with GitHub',
		size: 'icon',
		children: ($$renderer) => {
			RiGithubFill($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}