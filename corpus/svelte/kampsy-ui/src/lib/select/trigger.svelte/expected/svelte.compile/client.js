import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Error from "$lib/error/error.svelte";
import { getContext } from "svelte";

var root = $.from_html(`<div class="mt-2"><div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4"><!></div> <div> </div></div></div>`);
var root_1 = $.from_html(`<button><!></button> <!>`, 1);

export default function Trigger($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'class', 3, "");

	// Get the state of the select from the context
	const rootState = getContext("select");

	const toogle = (evt) => {
		const target = evt.currentTarget;
		const position = target.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const positionFromTop = position.top;
		const positionFromBottom = viewportHeight - position.bottom;

		if (positionFromTop > positionFromBottom) {
			rootState.setContentPosition(`bottom-[112%]`);
			rootState.setTransY(10);
		} else {
			rootState.setContentPosition(`top-[112%]`);
			rootState.setTransY(-10);
		}

		rootState.setIsActive(!rootState.getIsActive());
	};

	const sizeObj = {
		tiny: "h-[24px] text-xs leading-3",
		small: "h-8 px-[6px] text-sm leading-4",
		medium: "h-[40px] px-[10px] text-sm leading-5",
		large: "h-[48px] px-[14px] text-base leading-6"
	};

	let sizeClass = $.derived(() => {
		return sizeObj[rootState.size];
	});

	let ringClass = $.derived(() => {
		if (rootState.getError()) {
			return `bg-kui-light-bg dark:bg-kui-dark-bg border border-kui-light-red-700 dark:border-kui-dark-red-700
			hover:border-kui-light-gray-500 dark:hover:border-kui-dark-gray-500 ring ring-kui-light-red-400
			dark:ring-kui-dark-red-400 hover:ring-0 dark:hover:ring-0`;
		}

		return `bg-kui-light-bg dark:bg-kui-dark-bg border border-kui-light-gray-200 dark:border-kui-dark-gray-400
		hover:border-kui-light-gray-500 dark:hover:border-kui-dark-gray-500`;
	});

	let cursorClass = $.derived(() => {
		return rootState.getLoading() ? "cursor-not-allowed" : "cursor-auto";
	});

	let triggerClass = $.derived(() => {
		return `${$.get(sizeClass)}  ${$.get(ringClass)} ${$.get(cursorClass)}`;
	});

	// The size of the error text
	const errorTextObj = {
		tiny: "text-[12px] leading-[16px]",
		small: "text-[13px] leading-5",
		medium: "text-[14px] leading-5",
		large: "text-[16px] leading-6"
	};

	let errorText = $.derived(() => {
		return errorTextObj[rootState.size];
	});

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.child(button);

	$.snippet(node, () => $$props.children);
	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_2 = $.child(div_2);

			Error(node_2, {});
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var text = $.only_child(div_3, true);

			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_class(div_3, 1, `font-medium ${$.get(errorText) ?? ''} text-kui-light-red-900 dark:text-kui-dark-red-900`);
					$.set_text(text, $0);
				},
				[() => rootState.getError()]
			);

			$.append($$anchor, div);
		};

		var d = $.derived(() => rootState.getError());

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.template_effect(
		($0) => {
			button.disabled = $0;
			$.set_class(button, 1, `group transition-all ${$.get(triggerClass) ?? ''} rounded-md ${klass() ?? ''} `);
		},
		[() => rootState.getLoading()]
	);

	$.delegated('click', button, toogle);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);