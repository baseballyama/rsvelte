import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/index.js";
import { getContext } from "svelte";
import { fly } from "svelte/transition";
import { cubicOut } from "svelte/easing";

var root = $.from_html(`<div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-1001 w-full rounded-t-[10px] lg:bg-transparent"><div class="hide-scrollbar bg-kui-light-bg dark:bg-kui-dark-bg border-b-kui-light-gray-200 dark:border-b-kui-dark-gray-200 border-t-kui-light-gray-600 dark:border-t-kui-dark-gray-500
				overflow-y-auto scroll-smooth rounded-t-[10px] border-t
				border-b px-3 py-3"><!></div> <footer class="p-4"><!></footer></div>`);

var root_1 = $.from_html(`<div><div><!></div></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	const // Get the state of the select from the context
	mobileSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				$.snippet(node_1, () => $$props.children);
				$.reset(div_1);

				var footer = $.sibling(div_1, 2);
				var node_2 = $.child(footer);

				Button(node_2, {
					onclick: () => {
						rootState.setIsActive(false);
					},
					variant: 'secondary',
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('done');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(footer);
				$.reset(div);
				$.transition(1, div, () => fly, () => ({ y: "50vh", duration: 500, opacity: 1 }));
				$.transition(2, div, () => fly, () => ({ y: "100vh", duration: 600, easing: cubicOut, opacity: 1 }));
				$.append($$anchor, div);
			};

			var d = $.derived(() => rootState.getIsActive());

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	const desktopSnip = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_3 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var div_2 = root_1();
				var div_3 = $.child(div_2);
				var node_4 = $.child(div_3);

				$.snippet(node_4, () => $$props.children);
				$.reset(div_3);
				$.reset(div_2);

				$.template_effect(
					($0) => {
						$.set_class(div_2, 1, `absolute w-full ${$0 ?? ''} z-1000 ${klass() ?? ''}`);
						$.set_class(div_3, 1, `hide-scrollbar bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-y-auto scroll-smooth rounded-md border p-1 shadow-xs ${klass() ?? ''}`);
					},
					[() => rootState.getContentPosition()]
				);

				$.transition(1, div_2, () => fly, () => ({ y: rootState.getTransY() }));
				$.transition(2, div_2, () => fly, () => ({ y: rootState.getTransY() }));
				$.append($$anchor, div_2);
			};

			var d_1 = $.derived(() => rootState.getIsActive());

			$.if(node_3, ($$render) => {
				if ($.get(d_1)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let klass = $.prop($$props, 'class', 3, "");
	const rootState = getContext("select");
	var fragment_2 = $.comment();
	var node_5 = $.first_child(fragment_2);

	{
		var consequent_2 = ($$anchor) => {
			mobileSnip($$anchor);
		};

		var d_2 = $.derived(() => rootState.getIsMobile());

		var alternate = ($$anchor) => {
			desktopSnip($$anchor);
		};

		$.if(node_5, ($$render) => {
			if ($.get(d_2)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}