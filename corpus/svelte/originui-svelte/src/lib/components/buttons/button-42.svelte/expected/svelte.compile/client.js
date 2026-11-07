import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

var root = $.from_html(`<div class="inline-flex flex-wrap gap-2"><!> <!> <!> <!></div>`);

export default function Button_42($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		variant: 'outline',
		'aria-label': 'Login with Google',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			RiGoogleFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		variant: 'outline',
		'aria-label': 'Login with Facebook',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			RiFacebookFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		variant: 'outline',
		'aria-label': 'Login with X',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			RiTwitterXFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		variant: 'outline',
		'aria-label': 'Login with GitHub',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			RiGithubFill($$anchor, { width: '16', height: '16', 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}