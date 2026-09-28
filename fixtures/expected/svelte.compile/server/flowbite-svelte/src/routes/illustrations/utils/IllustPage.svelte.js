import * as $ from 'svelte/internal/server';
import { Modal } from "flowbite-svelte";
import { twMerge } from "tailwind-merge";
import DynamicCodeBlockHighlight from "./DynamicCodeBlockHighlight.svelte";
import { isGeneratedCodeOverflow, createImageVariants } from "./helper";

export default function IllustPage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icons,
			header,
			wrapperClass = "mx-auto max-w-8xl px-8",
			div1Class = "relative overflow-x-auto",
			div2Class,
			classDiv2 = "w-full p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-800",
			div3Class,
			classDiv3 = "grid grid-cols-1 gap-4 px-4 md:grid-cols-2 dark:text-white place-items-center",
			div4Class = "w-full place-items-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-800 hover:scale-105",
			labelClass = "text-lg py-4",
			searchClass,
			classSearch = "block w-64 rounded-lg border border-gray-300 bg-gray-50 p-2 ps-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
			tab1Class,
			classTab1 = "grid grid-cols-1 gap-8 px-4 pt-8 sm:grid-cols-2  lg:grid-cols-4 dark:text-white",
			tab2Class = "flex items-center text-lg",
			rangeClass,
			classRange = "mt-4 h-2 w=[100px] sm:w-[200px] cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700",
			contentClass = "rounded-lg dark_bg_theme mt-4",
			title,
			sizeByTailwind,
			minSize = "50",
			defaultSize = "100",
			maxSize = "200",
			step = "10",
			threeTabs = true,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let searchTerm = "";

		let filteredEntries = $.derived(() => Object.entries(icons).filter(([name]) => {
			return name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
		}));

		// $inspect('filteredEntries', filteredEntries);
		let selectedIllust = "";

		let illusts = $.derived(() => createImageVariants(selectedIllust));

		// $inspect("dark: ", illusts["dark"], "light: ", illusts["light"]);
		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (defaultSize !== "140") props.push(` size="${defaultSize}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `import { ${illusts()["light"]}, ${illusts()["dark"]} } from "flowbite-svelte-illustrations";
<div class="dark:hidden">
  <${illusts()["light"]} ${propsString}/>
</div>
<div class="hidden dark:block">
  <${illusts()["dark"]} ${propsString}/>
</div>
`;
		})());

		let illustModal = false;

		const updateIllust = (name) => {
			illustModal = true;
			selectedIllust = name;
		};

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('u5x1k2', $$renderer, ($$renderer) => {
				$$renderer.push(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/dark.min.css"/>`);
			});

			$$renderer.push(`<div class="w-full pb-20"><div${$.attr_class($.clsx(wrapperClass))}>`);

			if (header) {
				$$renderer.push('<!--[0-->');
				header($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(div1Class))}><div${$.attr_class($.clsx(twMerge(classDiv2, div2Class)))}><input type="search" id="site-search" name="q"${$.attr_class($.clsx(twMerge(classSearch, searchClass)))} placeholder="Search icons"${$.attr('value', searchTerm)}/> <input id="default-range" type="range"${$.attr('min', minSize)}${$.attr('max', maxSize)}${$.attr('value', defaultSize)}${$.attr('step', step)}${$.attr_class($.clsx(twMerge(classRange, rangeClass)))}/></div> <div${$.attr_class($.clsx(twMerge("w-full py-8 text-left text-gray-500 dark:text-gray-400 ", className)))}><div${$.attr_class($.clsx(twMerge(classDiv3, div3Class)))}><!--[-->`);

			const each_array = $.ensure_array_like(filteredEntries());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [name, Component] = each_array[$$index];

				if (name !== "Icon") {
					$$renderer.push(`<!--[0--><button class="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-4 hover:scale-105 dark:border-gray-800 dark:bg-gray-800" aria-label="modal-button"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg" class="absolute top-2 right-2 hidden group-hover:block"><path d="M7 8l-4 4l4 4"></path><path d="M17 8l4 4l-4 4"></path><path d="M14 4l-4 16"></path></svg> `);

					if (Component) {
						$$renderer.push('<!--[-->');
						Component($$renderer, $.spread_props([{ height: defaultSize }, restProps]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <span class="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(name)}</span></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			Modal($$renderer, {
				get open() {
					return illustModal;
				},

				set open($$value) {
					illustModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<h3 class="font-bold">${$.escape(selectedIllust)}</h3> `);

					DynamicCodeBlockHighlight($$renderer, {
						handleExpandClick: handleBuilderExpandClick,
						expand: builderExpand,
						showExpandButton: showBuilderExpandButton(),
						code: generatedCode()
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { defaultSize });
	});
}