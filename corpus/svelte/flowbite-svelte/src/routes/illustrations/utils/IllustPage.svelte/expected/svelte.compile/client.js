import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from "flowbite-svelte";
import { twMerge } from "tailwind-merge";
import DynamicCodeBlockHighlight from "./DynamicCodeBlockHighlight.svelte";
import { isGeneratedCodeOverflow, createImageVariants } from "./helper";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'icons',
	'header',
	'wrapperClass',
	'div1Class',
	'div2Class',
	'classDiv2',
	'div3Class',
	'classDiv3',
	'div4Class',
	'labelClass',
	'searchClass',
	'classSearch',
	'tab1Class',
	'classTab1',
	'tab2Class',
	'rangeClass',
	'classRange',
	'contentClass',
	'title',
	'sizeByTailwind',
	'minSize',
	'defaultSize',
	'maxSize',
	'step',
	'threeTabs',
	'class'
]);

var root = $.from_html(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/dark.min.css"/>`);
var root_1 = $.from_html(`<button class="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-4 hover:scale-105 dark:border-gray-800 dark:bg-gray-800" aria-label="modal-button"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg" class="absolute top-2 right-2 hidden group-hover:block"><path d="M7 8l-4 4l4 4"></path><path d="M17 8l4 4l-4 4"></path><path d="M14 4l-4 16"></path></svg> <!> <span class="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300"> </span></button>`);
var root_2 = $.from_html(`<h3 class="font-bold"> </h3> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full pb-20"><div><!> <div><div><input type="search" id="site-search" name="q" placeholder="Search icons"/> <input id="default-range" type="range"/></div> <div><div></div></div> <!></div></div></div>`);

export default function IllustPage($$anchor, $$props) {
	$.push($$props, true);

	let wrapperClass = $.prop($$props, 'wrapperClass', 3, "mx-auto max-w-8xl px-8"),
		div1Class = $.prop($$props, 'div1Class', 3, "relative overflow-x-auto"),
		classDiv2 = $.prop($$props, 'classDiv2', 3, "w-full p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-800"),
		classDiv3 = $.prop($$props, 'classDiv3', 3, "grid grid-cols-1 gap-4 px-4 md:grid-cols-2 dark:text-white place-items-center"),
		div4Class = $.prop($$props, 'div4Class', 3, "w-full place-items-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-800 hover:scale-105"),
		labelClass = $.prop($$props, 'labelClass', 3, "text-lg py-4"),
		classSearch = $.prop($$props, 'classSearch', 3, "block w-64 rounded-lg border border-gray-300 bg-gray-50 p-2 ps-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"),
		classTab1 = $.prop($$props, 'classTab1', 3, "grid grid-cols-1 gap-8 px-4 pt-8 sm:grid-cols-2  lg:grid-cols-4 dark:text-white"),
		tab2Class = $.prop($$props, 'tab2Class', 3, "flex items-center text-lg"),
		classRange = $.prop($$props, 'classRange', 3, "mt-4 h-2 w=[100px] sm:w-[200px] cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"),
		contentClass = $.prop($$props, 'contentClass', 3, "rounded-lg dark_bg_theme mt-4"),
		minSize = $.prop($$props, 'minSize', 3, "50"),
		defaultSize = $.prop($$props, 'defaultSize', 15, "100"),
		maxSize = $.prop($$props, 'maxSize', 3, "200"),
		step = $.prop($$props, 'step', 3, "10"),
		threeTabs = $.prop($$props, 'threeTabs', 3, true),
		className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	let searchTerm = $.state("");

	let filteredEntries = $.derived(() => Object.entries($$props.icons).filter(([name]) => {
		return name.toLowerCase().indexOf($.get(searchTerm).toLowerCase()) !== -1;
	}));

	// $inspect('filteredEntries', filteredEntries);
	let selectedIllust = $.state("");

	let illusts = $.derived(() => createImageVariants($.get(selectedIllust)));

	// $inspect("dark: ", illusts["dark"], "light: ", illusts["light"]);
	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if (defaultSize() !== "140") props.push(` size="${defaultSize()}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `import { ${$.get(illusts)["light"]}, ${$.get(illusts)["dark"]} } from "flowbite-svelte-illustrations";
<div class="dark:hidden">
  <${$.get(illusts)["light"]} ${propsString}/>
</div>
<div class="hidden dark:block">
  <${$.get(illusts)["dark"]} ${propsString}/>
</div>
`;
	})());

	let illustModal = $.state(false);

	const updateIllust = (name) => {
		$.set(illustModal, true);
		$.set(selectedIllust, name, true);
	};

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	var div = root_3();

	$.head('u5x1k2', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.header);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var div_3 = $.child(div_2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);

	$.each(div_5, 21, () => $.get(filteredEntries), ([name, Component]) => name, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let name = () => $.get($$array)[0];
		let Component = () => $.get($$array)[1];
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var button = root_1();
				var node_3 = $.sibling($.child(button), 2);

				$.component(node_3, Component, ($$anchor, Component_1) => {
					Component_1($$anchor, $.spread_props(
						{
							get height() {
								return defaultSize();
							}
						},
						() => restProps
					));
				});

				var span = $.sibling(node_3, 2);
				var text = $.only_child(span, true);

				$.reset(button);
				$.template_effect(() => $.set_text(text, name()));
				$.delegated('click', button, () => updateIllust(name()));
				$.append($$anchor, button);
			};

			$.if(node_2, ($$render) => {
				if (name() !== "Icon") $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.reset(div_5);
	$.reset(div_4);

	var node_4 = $.sibling(div_4, 2);

	Modal(node_4, {
		get open() {
			return $.get(illustModal);
		},

		set open($$value) {
			$.set(illustModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var h3 = $.first_child(fragment_2);
			var text_1 = $.only_child(h3, true);
			var node_5 = $.sibling(h3, 2);

			DynamicCodeBlockHighlight(node_5, {
				handleExpandClick: handleBuilderExpandClick,
				get expand() {
					return $.get(builderExpand);
				},

				get showExpandButton() {
					return $.get(showBuilderExpandButton);
				},

				get code() {
					return $.get(generatedCode);
				}
			});

			$.template_effect(() => $.set_text(text_1, $.get(selectedIllust)));
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4) => {
			$.set_class(div_1, 1, $.clsx(wrapperClass()));
			$.set_class(div_2, 1, $.clsx(div1Class()));
			$.set_class(div_3, 1, $0);
			$.set_class(input, 1, $1);
			$.set_attribute(input_1, 'min', minSize());
			$.set_attribute(input_1, 'max', maxSize());
			$.set_attribute(input_1, 'step', step());
			$.set_class(input_1, 1, $2);
			$.set_class(div_4, 1, $3);
			$.set_class(div_5, 1, $4);
		},
		[
			() => $.clsx(twMerge(classDiv2(), $$props.div2Class)),
			() => $.clsx(twMerge(classSearch(), $$props.searchClass)),
			() => $.clsx(twMerge(classRange(), $$props.rangeClass)),
			() => $.clsx(twMerge("w-full py-8 text-left text-gray-500 dark:text-gray-400 ", className())),
			() => $.clsx(twMerge(classDiv3(), $$props.div3Class))
		]
	);

	$.bind_value(input, () => $.get(searchTerm), ($$value) => $.set(searchTerm, $$value));
	$.bind_value(input_1, defaultSize);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);