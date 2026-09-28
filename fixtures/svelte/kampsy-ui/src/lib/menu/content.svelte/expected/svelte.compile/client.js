import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { fly } from "svelte/transition";
import { cubicOut } from "svelte/easing";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);

var root = $.from_html(`<div><div class="hide-scrollbar bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-600 dark:border-kui-dark-gray-500 overflow-y-auto
				scroll-smooth rounded-t-[10px] border-t px-3"><!></div></div>`);

var root_1 = $.from_html(`<div><div><!></div></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	const // Get the state of the menu from the context
	mobileSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();

				$.attribute_effect(div, () => ({
					class: 'bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-1001 w-full rounded-t-[10px] lg:bg-transparent',
					...rest
				}));

				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				$.snippet(node_1, () => $$props.children);
				$.reset(div_1);
				$.reset(div);
				$.bind_this(div, ($$value) => $.set(content, $$value), () => $.get(content));
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

				$.attribute_effect(
					div_2,
					($0) => ({
						class: `absolute ${$0 ?? ''} ${$.get(alightmentClass) ?? ''} z-1000 ${klass() ?? ''}`,
						...rest
					}),
					[() => rootState.getContentPosition()]
				);

				var div_3 = $.child(div_2);
				var node_3 = $.child(div_3);

				$.snippet(node_3, () => $$props.children);
				$.reset(div_3);
				$.reset(div_2);
				$.bind_this(div_2, ($$value) => $.set(content, $$value), () => $.get(content));
				$.template_effect(() => $.set_class(div_3, 1, `hide-scrollbar bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-y-auto scroll-smooth rounded-xl border p-2 shadow-xs ${klass() ?? ''}`));
				$.transition(1, div_2, () => fly, () => ({ y: rootState.getTransY() }));
				$.transition(2, div_2, () => fly, () => ({ y: rootState.getTransY() }));
				$.append($$anchor, div_2);
			};

			var d_1 = $.derived(() => rootState.getIsActive());

			$.if(node_2, ($$render) => {
				if ($.get(d_1)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let klass = $.prop($$props, 'class', 3, ""),
		rest = $.rest_props($$props, rest_excludes);

	const rootState = getContext("menu");

	let alightmentClass = $.derived(() => {
		if (rootState.alignment === "left") {
			return "left-0";
		} else {
			return "right-0";
		}
	});

	let content = $.state(void 0);

	$.user_effect(() => {
		if ($.get(content)) {
			if (rootState.getIsActive()) {
				$.get(content).setAttribute("aria-hidden", "false");
			} else {
				$.get(content).setAttribute("aria-hidden", "true");
			}
		}
	});

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