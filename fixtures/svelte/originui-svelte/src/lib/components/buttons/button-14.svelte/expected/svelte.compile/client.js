import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';

var root = $.from_html(`<div class="absolute inset-0 flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<span class="group-data-[loading=true]:text-transparent">Click me</span> <!>`, 1);

export default function Button_14($$anchor) {
	let isLoading = $.state(false);

	function handleClick() {
		$.set(isLoading, true);

		// Simulate an async operation
		setTimeout(
			() => {
				$.set(isLoading, false);
			},
			1000
		); // Reset after 1 second
	}

	Button($$anchor, {
		onclick: handleClick,
		get disabled() {
			return $.get(isLoading);
		},

		get 'data-loading'() {
			return $.get(isLoading);
		},
		class: 'group relative disabled:opacity-100',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1), 2);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var node_1 = $.child(div);

					LoaderCircle(node_1, { class: 'animate-spin', size: 16, 'aria-hidden': 'true' });
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if ($.get(isLoading)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}