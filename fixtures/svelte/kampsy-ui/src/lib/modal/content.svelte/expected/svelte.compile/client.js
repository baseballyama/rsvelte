import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "$lib/utils/event.js";
import { getContext } from "svelte";
import { cubicOut } from "svelte/easing";
import { fly, scale } from "svelte/transition";

var root = $.from_html(`<div role="dialog" class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-1001 w-full rounded-t-[10px] lg:bg-transparent"><div class="bg-kui-light-bg dark:bg-kui-dark-bg-secondary border-kui-light-gray-600 dark:border-kui-dark-gray-500 max-h-[80vh] w-full
				rounded-[10px] rounded-t-[10px] border-t"><!></div></div>`);

var root_1 = $.from_html(`<div role="dialog"><!></div>`);

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

				$.action(div_1, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => {
					rootState.setIsActive(false);
				});

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
		var node_2 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var div_2 = root_1();
				var node_3 = $.child(div_2);

				$.snippet(node_3, () => $$props.children);
				$.reset(div_2);

				$.action(div_2, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => {
					rootState.setIsActive(false);
				});

				$.template_effect(() => $.set_class(div_2, 1, `bg-kui-light-bg dark:bg-kui-dark-bg-secondary border-kui-light-gray-600 dark:border-kui-dark-gray-200 relative max-h-156.5 w-135
                rounded-xl border ${klass() ?? ''}`));

				$.transition(1, div_2, () => scale, () => ({ duration: 200 }));
				$.transition(2, div_2, () => scale, () => ({ duration: 300 }));
				$.append($$anchor, div_2);
			};

			var d_1 = $.derived(() => rootState.getIsActive());

			$.if(node_2, ($$render) => {
				if ($.get(d_1)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let klass = $.prop($$props, 'class', 3, "");
	const rootState = getContext("modal");
	var fragment_2 = $.comment();
	var node_4 = $.first_child(fragment_2);

	{
		var consequent_2 = ($$anchor) => {
			mobileSnip($$anchor);
		};

		var d_2 = $.derived(() => rootState.getIsMobile());

		var alternate = ($$anchor) => {
			desktopSnip($$anchor);
		};

		$.if(node_4, ($$render) => {
			if ($.get(d_2)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}