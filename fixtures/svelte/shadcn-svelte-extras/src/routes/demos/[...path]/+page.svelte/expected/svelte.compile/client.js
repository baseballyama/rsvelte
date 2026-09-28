import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Delayed from '$lib/components/delayed.svelte';
import { Spinner } from '$lib/components/ui/spinner/index.js';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button';
import { MinimizeIcon } from '@lucide/svelte';

var root = $.from_html(`<span class="text-muted-foreground flex items-center gap-2"><!> Loading...</span>`);
var root_1 = $.from_html(`<div class="fixed top-4 right-4"><!></div>`);
var root_2 = $.from_html(`<div class="flex min-h-dvh place-items-center justify-center"><!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const ComponentPromise = import(`$lib/demos/${$$props.data.path}.svelte`);
	const from = $.derived(() => page.url.searchParams.get('from'));
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.await(
		node,
		() => ComponentPromise,
		($$anchor) => {
			Delayed($$anchor, {
				delay: 1000,
				children: ($$anchor, $$slotProps) => {
					var span = root();
					var node_2 = $.child(span);

					Spinner(node_2, {});
					$.next();
					$.reset(span);
					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { default: Component } = $.get($$source);

				return { Component };
			});

			var Component = $.derived(() => $.get($$value).Component);
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $.get(Component), ($$anchor, Component_1) => {
				Component_1($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		}
	);

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var node_4 = $.child(div_1);

			Button(node_4, {
				get href() {
					return $.get(from);
				},
				size: 'icon',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					MinimizeIcon($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(from) !== null) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}