import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Information from "$lib/icons/information.svelte";
import CheckCircle from "$lib/icons/check-circle.svelte";
import Error from "$lib/icons/error.svelte";
import Warning from "$lib/icons/warning.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'size',
	'action',
	'disabled',
	'type',
	'fill',
	'children'
]);

var root = $.from_html(`<div class="w-full"><div><div><div class="h-4 w-4"><div class="h-4 w-4"><!></div></div> <span><!></span></div> <!></div></div>`);

export default function Note($$anchor, $$props) {
	const icon = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				CheckCircle($$anchor, {});
			};

			var consequent_1 = ($$anchor) => {
				Error($$anchor, {});
			};

			var consequent_2 = ($$anchor) => {
				Warning($$anchor, {});
			};

			var alternate = ($$anchor) => {
				Information($$anchor, {});
			};

			$.if(node, ($$render) => {
				if (type() === "success") $$render(consequent); else if (type() === "error") $$render(consequent_1, 1); else if (type() === "warning") $$render(consequent_2, 2); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let klass = $.prop($$props, 'class', 3, ""),
		size = $.prop($$props, 'size', 3, "medium"),
		action = $.prop($$props, 'action', 3, undefined),
		disabled = $.prop($$props, 'disabled', 3, false),
		type = $.prop($$props, 'type', 3, "default"),
		fill = $.prop($$props, 'fill', 3, false),
		children = $.prop($$props, 'children', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const sizeObj = {
		small: "px-[8px] py-[8px] text-xs leading-4",
		medium: "px-[12px] py-[9px] text-sm leading-[21px]",
		large: "px-[12px] py-[11px] text-base leading-6"
	};

	let sizeClass = $.derived(() => {
		return sizeObj[size()];
	});

	const iconAndTextGapObj = { small: "gap-2", medium: "gap-3", large: "gap-3" };

	let iconAndTextGapClass = $.derived(() => {
		return iconAndTextGapObj[size()];
	});

	let radiusClass = $.derived(() => {
		if (action()) {
			return "rounded-[10px]";
		}

		return "rounded-md";
	});

	const typeBorderObj = {
		success: `border border-kui-light-blue-400 dark:border-kui-dark-blue-400`,
		error: `border border-kui-light-red-400 dark:border-kui-dark-red-400`,
		warning: "border border-kui-light-amber-400 dark:border-kui-dark-amber-400",
		secondary: `border border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400`,
		violet: `border border-kui-light-purple-400 dark:border-kui-dark-purple-400`,
		cyan: `border border-kui-light-teal-400 dark:border-kui-dark-teal-400`,
		default: `border border-kui-light-gray-400 dark:border-kui-dark-gray-400`
	};

	let typeBorderClass = $.derived(() => {
		return typeBorderObj[type()];
	});

	const fillObj = {
		success: `bg-kui-light-blue-200 dark:bg-kui-dark-blue-200 border border-kui-light-blue-200
		dark:border-kui-dark-blue-200`,

		error: `bg-kui-light-red-200 dark:bg-kui-dark-red-200 border border-kui-light-red-200
		dark:border-kui-dark-red-200`,

		warning: `bg-kui-light-amber-200 dark:bg-kui-dark-amber-200 border border-kui-light-amber-200
		dark:border-kui-dark-amber-200`,

		secondary: `bg-kui-light-gray-alpha-200 dark:bg-kui-dark-gray-alpha-200 border border-kui-light-gray-alpha-200
		dark:border-kui-dark-gray-alpha-200`,

		violet: `bg-kui-light-purple-200 dark:bg-kui-dark-purple-200 border border-kui-light-purple-200
		dark:border-kui-dark-purple-200`,

		cyan: `bg-kui-light-teal-200 dark:bg-kui-dark-teal-200 border border-kui-light-teal-200
		dark:border-kui-dark-teal-200`,

		default: `bg-kui-light-gray-200 dark:bg-kui-dark-gray-200 border border-kui-light-gray-200
		dark:border-kui-dark-gray-200`
	};

	let fillClass = $.derived(() => {
		return fillObj[type()];
	});

	const typeTextObj = {
		success: `text-kui-light-blue-900 dark:text-kui-dark-blue-900 selection:bg-kui-light-blue-900
		selection:text-kui-light-blue-100 dark:selection:bg-kui-dark-blue-800  dark:selection:text-kui-dark-blue-1000
		[&_a]:text-kui-light-blue-1000 dark:[&_a]:text-kui-dark-blue-1000`,

		error: `text-kui-light-red-900 dark:text-kui-dark-red-900 selection:bg-kui-light-red-900
		selection:text-kui-light-red-100 dark:selection:bg-kui-dark-red-800  dark:selection:text-kui-dark-red-1000
		[&_a]:text-kui-light-red-1000 dark:[&_a]:text-kui-dark-red-1000`,

		warning: `text-kui-light-amber-900 dark:text-kui-dark-amber-900 selection:bg-kui-light-amber-900
		selection:text-kui-light-amber-100 dark:selection:bg-kui-dark-amber-800  dark:selection:text-kui-dark-amber-1000
		[&_a]:text-kui-light-amber-1000 dark:[&_a]:text-kui-dark-amber-1000`,

		secondary: `text-kui-light-gray-alpha-900 dark:text-kui-dark-gray-alpha-900 selection:bg-kui-light-gray-900
		selection:text-kui-light-gray-100 dark:selection:bg-kui-dark-gray-800  dark:selection:text-kui-dark-gray-1000
		[&_a]:text-kui-light-gray-alpha-1000 dark:[&_a]:text-kui-dark-gray-alpha-1000`,

		violet: `text-kui-light-purple-900 dark:text-kui-dark-purple-900 selection:bg-kui-light-purple-900
		selection:text-kui-light-purple-100 dark:selection:bg-kui-dark-purple-800  dark:selection:text-kui-dark-purple-1000
		[&_a]:text-kui-light-purple-1000 dark:[&_a]:text-kui-dark-purple-1000`,

		cyan: `text-kui-light-teal-900 dark:text-kui-dark-teal-900 selection:bg-kui-light-teal-900
		selection:text-kui-light-teal-100 dark:selection:bg-kui-dark-teal-800  dark:selection:text-kui-dark-teal-1000
		[&_a]:text-kui-light-teal-1000 dark:[&_a]:text-kui-dark-teal-1000`,

		default: `text-kui-light-gray-900 dark:text-kui-dark-gray-900 selection:bg-kui-light-gray-900
		selection:text-kui-light-gray-100 dark:selection:bg-kui-dark-gray-800  dark:selection:text-kui-dark-gray-1000
		[&_a]:text-kui-light-gray-1000 dark:[&_a]:text-kui-dark-gray-1000`
	};

	let textClass = $.derived(() => {
		return typeTextObj[type()];
	});

	const contClass = $.derived(() => {
		if (fill()) {
			return `${$.get(fillClass)}`;
		}

		return `${$.get(typeBorderClass)}`;
	});

	var div = root();
	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({
		class: `w-full space-y-2 md:flex md:items-center md:justify-between md:space-y-0 lg:gap-x-3
		class:disabled=${disabled() ?? ''}
		aria-disabled=${disabled() ?? ''}
		${$.get(contClass) ?? ''} ${$.get(radiusClass) ?? ''} ${$.get(sizeClass) ?? ''} ${klass() ?? ''}`,
		...rest
	}));

	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var node_1 = $.child(div_4);

	icon(node_1);
	$.reset(div_4);
	$.reset(div_3);

	var span = $.sibling(div_3, 2);
	var node_2 = $.child(span);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_3 = $.first_child(fragment_5);

			$.snippet(node_3, children);
			$.append($$anchor, fragment_5);
		};

		$.if(node_2, ($$render) => {
			if (children()) $$render(consequent_3);
		});
	}

	$.reset(span);
	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_5 = $.first_child(fragment_6);

			$.snippet(node_5, action);
			$.append($$anchor, fragment_6);
		};

		$.if(node_4, ($$render) => {
			if (action()) $$render(consequent_4);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_class(div_2, 1, `flex items-center ${$.get(iconAndTextGapClass) ?? ''} ${$.get(textClass) ?? ''}`));
	$.append($$anchor, div);
}