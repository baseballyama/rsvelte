import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollSpy, Radio, P, Heading, Alert } from "$lib";
import { HighlightSvelte } from "svelte-rune-highlight";
import "highlight.js/styles/github-dark.css";

var root = $.from_html(`<strong>Note:</strong> Make sure each section has an <code>id</code> attribute that matches the <code>id</code> in your items array.`, 1);
var root_1 = $.from_html(`<div><!> <main><div class="my-4 flex p-2"><!> <div class="flex gap-3"><!> <!> <!></div></div> <section id="introduction" class="p-4"><!> <!></section> <section id="installation" class="border-t border-gray-200 px-4 py-8 dark:border-gray-700"><!> <!> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!></section> <section id="basic-usage" class="px-4 pb-16"><!> <!> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!></section> <section id="features" class="px-4 pb-16"><!> <h3 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Custom Positioning</h3> <p class="mb-4 text-gray-700 dark:text-gray-300">You can position the navigation on the top, left, or right:</p> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <h3 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Offset for Fixed Headers</h3> <p class="mb-4 text-gray-700 dark:text-gray-300">If you have a fixed header, use the <code>offset</code> prop to adjust when sections are considered "active":</p> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <h3 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Custom Active Styling</h3> <p class="mb-4 text-gray-700 dark:text-gray-300">Customize the appearance of active navigation items:</p> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper></section> <section id="props" class="px-4 pb-16"><!> <div class="overflow-x-auto"><table class="w-full border-collapse text-left"><thead><tr class="border-b border-gray-300 dark:border-gray-700"><th class="px-4 py-3 font-semibold text-gray-900 dark:text-white">Prop</th><th class="px-4 py-3 font-semibold text-gray-900 dark:text-white">Type</th><th class="px-4 py-3 font-semibold text-gray-900 dark:text-white">Default</th><th class="px-4 py-3 font-semibold text-gray-900 dark:text-white">Description</th></tr></thead><tbody class="text-gray-700 dark:text-gray-300"><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">items</td><td class="px-4 py-3 font-mono text-sm">ScrollSpyItem[]</td><td class="px-4 py-3">required</td><td class="px-4 py-3">Array of navigation items</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">position</td><td class="px-4 py-3 font-mono text-sm">'top'|'left'|'right'</td><td class="px-4 py-3">'top'</td><td class="px-4 py-3">Position of the navigation bar</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">offset</td><td class="px-4 py-3 font-mono text-sm">number</td><td class="px-4 py-3">0</td><td class="px-4 py-3">Offset in pixels from top for active section calculation</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">sticky</td><td class="px-4 py-3 font-mono text-sm">boolean</td><td class="px-4 py-3">true</td><td class="px-4 py-3">Enable sticky positioning</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">activeClass</td><td class="px-4 py-3 font-mono text-sm">string</td><td class="px-4 py-3">''</td><td class="px-4 py-3">Custom Tailwind classes for active items</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">class</td><td class="px-4 py-3 font-mono text-sm">string</td><td class="px-4 py-3">''</td><td class="px-4 py-3">Custom Tailwind classes for the nav container</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">smoothScroll</td><td class="px-4 py-3 font-mono text-sm">boolean</td><td class="px-4 py-3">true</td><td class="px-4 py-3">Enable smooth scroll behavior</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">onActiveChange</td><td class="px-4 py-3 font-mono text-sm">(id: string) => void</td><td class="px-4 py-3">undefined</td><td class="px-4 py-3">Callback when active section changes</td></tr><tr class="border-b border-gray-200 dark:border-gray-800"><td class="px-4 py-3 font-mono text-sm">onNavigate</td><td class="px-4 py-3 font-mono text-sm">(id: string) => void</td><td class="px-4 py-3">undefined</td><td class="px-4 py-3">Callback when navigation item is clicked</td></tr></tbody></table></div></section> <section id="accessibility" class="px-4 pb-16"><!> <p class="mb-6 text-gray-700 dark:text-gray-300">The ScrollSpy component is built with accessibility in mind:</p> <ul class="space-y-4 text-gray-700 dark:text-gray-300"><li class="flex items-start"><span class="mr-3 text-green-500">✓</span> <span><strong>Keyboard Navigation:</strong> Navigation items are fully keyboard accessible using Tab and Enter/Space</span></li> <li class="flex items-start"><span class="mr-3 text-green-500">✓</span> <span><strong>ARIA Support:</strong> Uses semantic HTML and aria-current for the active section</span></li> <li class="flex items-start"><span class="mr-3 text-green-500">✓</span> <span><strong>Visible Focus State:</strong> Focus rings are preserved for keyboard users</span></li> <li class="flex items-start"><span class="mr-3 text-green-500">✓</span> <span><strong>Screen Reader Friendly:</strong> Lists and links are announced correctly by assistive technology</span></li> <li class="flex items-start"><span class="mr-3 text-green-500">✓</span> <span><strong>Color Contrast:</strong> Default styles follow WCAG AA contrast guidelines</span></li></ul> <div class="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20"><h3 class="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">Best Practices</h3> <ul class="space-y-2 text-green-800 dark:text-green-200"><li>• Use clear, descriptive labels for each navigation item</li> <li>• Ensure sufficient color contrast if overriding default styles</li> <li>• Test with keyboard-only navigation and screen readers</li> <li>• Provide meaningful and properly structured section headings</li></ul></div></section></main></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const exampleModules = import.meta.glob("./md/*.*", { query: "?raw", import: "default", eager: true });

	const navigationItems = [
		{ id: "introduction", label: "Introduction" },
		{ id: "installation", label: "Installation" },
		{ id: "basic-usage", label: "Basic Usage" },
		{ id: "features", label: "Features" },
		{ id: "props", label: "Props" },
		{ id: "accessibility", label: "Accessibility" }
	];

	const TOP_OFFSET = 80;
	const SIDE_OFFSET = 20;
	let isFlex = $.state(false);
	let position = $.state("top");
	let offsetValue = $.state(80);
	let isSticky = $.state(true);

	const handleStickyToggle = () => {
		// if position is top, set isSticky to true, else set to true
		$.set(isSticky, $.get(position) === "top" ? true : true, true);
	};

	const handleFlexToggle = () => {
		// if position is top, set no flex, else set flex
		$.set(isFlex, $.get(position) !== "top" ? true : false, true);
	};

	const handleOffsetChange = () => {
		$.set(offsetValue, $.get(position) === "top" ? TOP_OFFSET : SIDE_OFFSET, true);
	};

	const handlePositionChange = (newPosition) => {
		$.set(position, newPosition, true);
		handleFlexToggle();
		handleOffsetChange();
		handleStickyToggle();
	};

	const mainMarginClass = $.derived(() => $.get(position) === "left" ? "ml-64" : $.get(position) === "right" ? "mr-64" : "");
	var div = root_1();
	var node = $.child(div);

	ScrollSpy(node, {
		get items() {
			return navigationItems;
		},

		get position() {
			return $.get(position);
		},

		get offset() {
			return $.get(offsetValue);
		},

		get sticky() {
			return $.get(isSticky);
		},
		smoothScroll: true
	});

	var main = $.sibling(node, 2);
	var div_1 = $.child(main);
	var node_1 = $.child(div_1);

	P(node_1, {
		class: 'me-2 text-xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Position:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	Radio(node_2, {
		value: 'top',
		onchange: () => handlePositionChange("top"),
		get group() {
			return $.get(position);
		},

		set group($$value) {
			$.set(position, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Top');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Radio(node_3, {
		value: 'left',
		onchange: () => handlePositionChange("left"),
		get group() {
			return $.get(position);
		},

		set group($$value) {
			$.set(position, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Left');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Radio(node_4, {
		value: 'right',
		onchange: () => handlePositionChange("right"),
		get group() {
			return $.get(position);
		},

		set group($$value) {
			$.set(position, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Right');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var node_5 = $.child(section);

	Heading(node_5, {
		tag: 'h1',
		class: 'text-4xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('ScrollSpy Component');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	P(node_6, {
		class: 'mb-4 text-lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('A navigation component that tracks scroll position and highlights the currently visible section. Supports smooth scrolling, sticky positioning, custom scroll containers, offset handling, and\n        active state callbacks for building interactive page or documentation navigation.');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_7 = $.child(section_1);

	Heading(node_7, {
		tag: 'h2',
		class: 'mb-6 text-3xl font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Installation');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	P(node_8, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Install the required packages:');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	{
		$.css_props(node_9, () => ({ '--langtag-color': 'orange' }));

		HighlightSvelte(node_9.lastChild, {
			get code() {
				return exampleModules["./md/installation.md"];
			},
			langtag: true,
			class: 'mb-4'
		});

		$.reset(node_9);
	}

	var node_10 = $.sibling(node_9, 2);

	P(node_10, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('This installs `flowbite-svelte` (Svelte components) and `flowbite` as development dependencies.');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_11 = $.child(section_2);

	Heading(node_11, {
		tag: 'h2',
		class: 'mb-6 text-3xl font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Basic Usage');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	P(node_12, {
		class: 'mb-6 text-gray-700 dark:text-gray-300',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('The simplest way to use ScrollSpy is to provide an array of navigation items:');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	{
		$.css_props(node_13, () => ({ '--langtag-color': 'orange' }));

		HighlightSvelte(node_13.lastChild, {
			get code() {
				return exampleModules["./md/usage.md"];
			},
			langtag: true,
			class: 'mb-4'
		});

		$.reset(node_13);
	}

	var node_14 = $.sibling(node_13, 2);

	Alert(node_14, {
		color: 'red',
		class: 'text-md p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();

			$.next(5);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var node_15 = $.child(section_3);

	Heading(node_15, {
		tag: 'h2',
		class: 'mb-6 text-3xl font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Features');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 6);

	{
		$.css_props(node_16, () => ({ '--langtag-color': 'orange' }));

		HighlightSvelte(node_16.lastChild, {
			get code() {
				return exampleModules["./md/position.md"];
			},
			langtag: true,
			class: 'mb-4'
		});

		$.reset(node_16);
	}

	var node_17 = $.sibling(node_16, 6);

	{
		$.css_props(node_17, () => ({ '--langtag-color': 'orange' }));

		HighlightSvelte(node_17.lastChild, {
			get code() {
				return exampleModules["./md/offset.md"];
			},
			langtag: true,
			class: 'mb-4'
		});

		$.reset(node_17);
	}

	var node_18 = $.sibling(node_17, 6);

	{
		$.css_props(node_18, () => ({ '--langtag-color': 'orange' }));

		HighlightSvelte(node_18.lastChild, {
			get code() {
				return exampleModules["./md/style.md"];
			},
			langtag: true,
			class: 'mb-4'
		});

		$.reset(node_18);
	}

	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var node_19 = $.child(section_4);

	Heading(node_19, {
		tag: 'h2',
		class: 'mb-6 text-3xl font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Props Reference');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(section_4);

	var section_5 = $.sibling(section_4, 2);
	var node_20 = $.child(section_5);

	Heading(node_20, {
		tag: 'h2',
		class: 'mb-6 text-3xl font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Accessibility');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	$.next(6);
	$.reset(section_5);
	$.reset(main);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `${$.get(isFlex) ? 'flex' : ''} pb-32 dark:bg-gray-900`);
		$.set_class(main, 1, `container mx-auto px-4 pb-8 ${$.get(mainMarginClass) ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}