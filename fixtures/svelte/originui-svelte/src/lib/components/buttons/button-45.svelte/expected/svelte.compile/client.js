import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import RiFacebookFill from '~icons/ri/facebook-fill';
import RiGithubFill from '~icons/ri/github-fill';
import RiGoogleFill from '~icons/ri/google-fill';
import RiTwitterXFill from '~icons/ri/twitter-x-fill';

var root = $.from_html(`<span class="pointer-events-none me-2 flex-1"><!></span> Login with Google`, 1);
var root_1 = $.from_html(`<span class="pointer-events-none me-2 flex-1"><!></span> Login with X`, 1);
var root_2 = $.from_html(`<span class="pointer-events-none me-2 flex-1"><!></span> Login with Facebook`, 1);
var root_3 = $.from_html(`<span class="pointer-events-none me-2 flex-1"><!></span> Login with GitHub`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-2"><!> <!> <!> <!></div>`);

export default function Button_45($$anchor) {
	var div = root_4();
	var node = $.child(div);

	Button(node, {
		class: 'bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var span = $.first_child(fragment);
			var node_1 = $.child(span);

			RiGoogleFill(node_1, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.reset(span);
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		class: 'bg-[#14171a] text-white after:flex-1 hover:bg-[#14171a]/90',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var span_1 = $.first_child(fragment_1);
			var node_3 = $.child(span_1);

			RiTwitterXFill(node_3, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.reset(span_1);
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		class: 'bg-[#1877f2] text-white after:flex-1 hover:bg-[#1877f2]/90',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var span_2 = $.first_child(fragment_2);
			var node_5 = $.child(span_2);

			RiFacebookFill(node_5, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.reset(span_2);
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	Button(node_6, {
		class: 'bg-[#333333] text-white after:flex-1 hover:bg-[#333333]/90',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var span_3 = $.first_child(fragment_3);
			var node_7 = $.child(span_3);

			RiGithubFill(node_7, {
				class: 'opacity-60',
				width: '16',
				height: '16',
				'aria-hidden': 'true'
			});

			$.reset(span_3);
			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}