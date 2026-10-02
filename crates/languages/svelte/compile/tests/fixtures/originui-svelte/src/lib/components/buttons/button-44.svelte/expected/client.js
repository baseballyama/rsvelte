import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

var root = $.from_html(`<!> Login with Google`, 1);
var root_1 = $.from_html(`<!> Login with X`, 1);
var root_2 = $.from_html(`<!> Login with Facebook`, 1);
var root_3 = $.from_html(`<!> Login with GitHub`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-2"><!> <!> <!> <!></div>`);

export default function Button_44($$anchor) {
	var div = root_4();
	var node = $.child(div);

	Button(node, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			RiGoogleFill(node_1, {
				class: 'me-1 text-[#DB4437] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			RiTwitterXFill(node_3, {
				class: 'me-1 text-[#14171a] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_5 = $.first_child(fragment_2);

			RiFacebookFill(node_5, {
				class: 'me-1 text-[#1877f2] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	Button(node_6, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_7 = $.first_child(fragment_3);

			RiGithubFill(node_7, {
				class: 'me-1 text-[#333333] dark:text-white/60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}