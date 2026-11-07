import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import { twMerge } from "tailwind-merge";

const bgColors = {
	gray: "bg-gray-50 dark:bg-gray-800",
	red: "bg-red-50 dark:bg-gray-800",
	yellow: "bg-yellow-50 dark:bg-gray-800 ",
	green: "bg-green-50 dark:bg-gray-800 ",
	indigo: "bg-indigo-50 dark:bg-gray-800 ",
	purple: "bg-purple-50 dark:bg-gray-800 ",
	pink: "bg-pink-50 dark:bg-gray-800 ",
	blue: "bg-blue-50 dark:bg-gray-800 ",
	light: "bg-gray-50 dark:bg-gray-700",
	dark: "bg-gray-50 dark:bg-gray-800",
	default: "bg-white dark:bg-gray-800",
	dropdown: "bg-white dark:bg-gray-700",
	navbar: "bg-white dark:bg-gray-900",
	navbarUl: "bg-gray-50 dark:bg-gray-800",
	form: "bg-gray-50 dark:bg-gray-700",
	primary: "bg-primary-50 dark:bg-gray-800 ",
	orange: "bg-orange-50 dark:bg-orange-800",
	none: ""
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'tag',
	'href',
	'color',
	'rounded',
	'border',
	'shadow',
	'node',
	'use',
	'options',
	'role',
	'transition',
	'params',
	'open',
	'class'
]);

export default function Frame($$anchor, $$props) {
	$.push($$props, true);

	const noop = () => {};

	let color = $.prop($$props, 'color', 3, "default"),
		node = $.prop($$props, 'node', 7),
		use = $.prop($$props, 'use', 3, noop),
		options = $.prop($$props, 'options', 19, () => ({})),
		open = $.prop($$props, 'open', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	let computedTag = $.derived(() => $$props.tag ?? ($$props.href ? "a" : "div"));

	setContext("background", true);

	// const dispatch = createEventDispatcher();
	// $: dispatch(open ? 'open' : 'close');
	// $: dispatch('show', open);
	// $: color = color ?? 'default'; // for cases when undefined
	$.user_effect(() => {
		setContext("color", color());
	});

	// your script goes here
	const textColors = {
		gray: "text-gray-800 dark:text-gray-300",
		red: "text-red-800 dark:text-red-400",
		yellow: "text-yellow-800 dark:text-yellow-300",
		green: "text-green-800 dark:text-green-400",
		indigo: "text-indigo-800 dark:text-indigo-400",
		purple: "text-purple-800 dark:text-purple-400",
		pink: "text-pink-800 dark:text-pink-400",
		blue: "text-blue-800 dark:text-blue-400",
		light: "text-gray-700 dark:text-gray-300",
		dark: "text-gray-700 dark:text-gray-300",
		default: "text-gray-500 dark:text-gray-300",
		dropdown: "text-gray-700 dark:text-gray-200",
		navbar: "text-gray-700 dark:text-gray-200",
		navbarUl: "text-gray-700 dark:text-gray-300",
		form: "text-gray-900 dark:text-white",
		primary: "text-primary-800 dark:text-primary-400",
		orange: "text-orange-800 dark:text-orange-400",
		none: ""
	};

	const borderColors = {
		gray: "border-gray-300 dark:border-gray-800 divide-gray-300 dark:divide-gray-800",
		red: "border-red-300 dark:border-red-800 divide-red-300 dark:divide-red-800",
		yellow: "border-yellow-300 dark:border-yellow-800 divide-yellow-300 dark:divide-yellow-800",
		green: "border-green-300 dark:border-green-800 divide-green-300 dark:divide-green-800",
		indigo: "border-indigo-300 dark:border-indigo-800 divide-indigo-300 dark:divide-indigo-800",
		purple: "border-purple-300 dark:border-purple-800 divide-purple-300 dark:divide-purple-800",
		pink: "border-pink-300 dark:border-pink-800 divide-pink-300 dark:divide-pink-800",
		blue: "border-blue-300 dark:border-blue-800 divide-blue-300 dark:divide-blue-800",
		light: "border-gray-500 divide-gray-500",
		dark: "border-gray-500 divide-gray-500",
		default: "border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700",
		dropdown: "border-gray-100 dark:border-gray-600 divide-gray-100 dark:divide-gray-600",
		navbar: "border-gray-100 dark:border-gray-700 divide-gray-100 dark:divide-gray-700",
		navbarUl: "border-gray-100 dark:border-gray-700 divide-gray-100 dark:divide-gray-700",
		form: "border-gray-300 dark:border-gray-700 divide-gray-300 dark:divide-gray-700",
		primary: "border-primary-500 dark:border-primary-200  divide-primary-500 dark:divide-primary-200 ",
		orange: "border-orange-300 dark:border-orange-800 divide-orange-300 dark:divide-orange-800",
		none: ""
	};

	let divClass = $.derived(() => twMerge(bgColors[color()], textColors[color()], $$props.rounded && "rounded-lg", $$props.border && "border", borderColors[color()], $$props.shadow && "shadow-md", $$props.class));
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.element(node_2, () => $.get(computedTag), false, ($$element, $$anchor) => {
				$.action($$element, ($$node, $$action_arg) => use()?.($$node, $$action_arg), options);
				$.bind_this($$element, ($$value) => node($$value), () => node());
				$.attribute_effect($$element, () => ({ role: $$props.role, ...restProps, class: $.get(divClass) }));
				$.transition(3, $$element, () => $$props.transition, () => $$props.params);

				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.snippet(node_3, () => $$props.children);
				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			$.element(node_4, () => $.get(computedTag), false, ($$element_1, $$anchor) => {
				$.action($$element_1, ($$node, $$action_arg) => use()?.($$node, $$action_arg), options);
				$.bind_this($$element_1, ($$value) => node($$value), () => node());
				$.attribute_effect($$element_1, () => ({ role: $$props.role, ...restProps, class: $.get(divClass) }));

				var fragment_4 = $.comment();
				var node_5 = $.first_child(fragment_4);

				$.snippet(node_5, () => $$props.children);
				$.append($$anchor, fragment_4);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_1, ($$render) => {
			if ($$props.transition && open()) $$render(consequent); else if (open()) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}