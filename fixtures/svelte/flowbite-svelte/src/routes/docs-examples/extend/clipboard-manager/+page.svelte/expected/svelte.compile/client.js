import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ExampleWrapper,
	HighlightCompo,
	transformComponents,
	transformModules
} from "svelte-rune-highlight";

import { Table } from "$lib";
import { clipboardManagerProps } from "./clipboardManagerProps";
import { List, Li, P, Heading } from "$lib";

var root = $.from_html(`Limit selection menu to specific content area using CSS selector using <code class="text-primary-700 font-bold">selectionTarget</code> prop.`, 1);
var root_1 = $.from_html(`Use <code class="text-primary-700 font-bold">enableSelectionMenu</code> to show selection bubble menu.`, 1);
var root_2 = $.from_html(`Set <code class="text-primary-700 font-bold">storageKey</code> to customize the localStorage key name.`, 1);
var root_3 = $.from_html(`Use <code class="text-primary-700 font-bold">items</code> prop to set initial value. Use <code class="text-primary-700 font-bold">limit</code> prop to set max items to store.`, 1);
var root_4 = $.from_html(`Use <code class="text-primary-700 font-bold">saveLabel</code> and <code class="text-primary-700 font-bold">clearLabel</code> to change labels.`, 1);
var root_5 = $.from_html(`The <code class="text-primary-700">saveToStorage</code> prop controls whether the clipboard items are saved to localStorage so they survive page refreshes and browser sessions.`, 1);
var root_6 = $.from_html(`When <code class="text-primary-700"></code> (default):`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`When <code class="text-primary-700"></code> :`, 1);
var root_9 = $.from_html(`Use <code class="text-primary-700"></code> to unblock sensitive data such as password pattern, api token pattern, etc. The component provide default function (see below) to detect sensitive data. However use the <code class="text-primary-700">detectSensitiveData</code> prop to provide your own logic.`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`Use <code class="text-primary-700"></code> to hide the input box and use only selection menu with custom rendering`, 1);
var root_12 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_13 = $.from_html(`<span class="text-2xl">👆</span> Selection Menu`, 1);
var root_14 = $.from_html(`<span class="text-green-500">✓</span> <span>Faster for existing content</span>`, 1);
var root_15 = $.from_html(`<span class="text-green-500">✓</span> <span>No context switching</span>`, 1);
var root_16 = $.from_html(`<span class="text-green-500">✓</span> <span>Natural workflow</span>`, 1);
var root_17 = $.from_html(`<span class="text-green-500">✓</span> <span>Works on mobile</span>`, 1);
var root_18 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_19 = $.from_html(`<span class="text-2xl">⌨️</span> Manual Input`, 1);
var root_20 = $.from_html(`<span class="text-green-500">✓</span> <span>Create new snippets</span>`, 1);
var root_21 = $.from_html(`<span class="text-green-500">✓</span> <span>Edit before saving</span>`, 1);
var root_22 = $.from_html(`<span class="text-green-500">✓</span> <span>Paste from external sources</span>`, 1);
var root_23 = $.from_html(`<span class="text-green-500">✓</span> <span>More control</span>`, 1);
var root_24 = $.from_html(`<div class="mx-auto max-w-7xl space-y-8 p-6"><div class="space-y-2"><!> <!></div> <!> <section class="space-y-6"><!> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Basic</span> <!></div> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Targeted</span> <!></div> <!> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Modal</span> <!></div> <!> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Documentation</span> <!></div> <!> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">Content</span> <!></div> <!> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-800">Support</span> <!></div> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">localStorage</span> <!></div> <!> <!> <!> <!> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">Developer</span> <!></div> <!> <!> <!> <!> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">Advanced</span> <!></div> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Selection Only</span> <!></div> <!> <!></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">Custom</span> <!></div> <!> <!></div></section> <section class="space-y-4 rounded-lg p-6 shadow"><!> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div class="border-l-4 border-green-500 pl-4"><!> <!></div> <div class="border-l-4 border-red-500 pl-4"><!> <!></div></div></section> <section class="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6"><!> <div class="grid grid-cols-1 gap-6 md:grid-cols-2"><div class="rounded-lg p-4"><!> <!></div> <div class="rounded-lg p-4"><!> <!></div></div> <p class="mt-4 text-center text-sm text-gray-600">💡 <strong>Pro tip:</strong> Enable both for maximum flexibility!</p></section> <section class="space-y-6"><!> <!></section></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const componentModules = import.meta.glob("./examples/*.svelte", { eager: true });

	// Import source code
	const exampleModules = import.meta.glob("./examples/*.svelte", { query: "?raw", import: "default", eager: true });

	// Transform both using helper functions
	const components = transformComponents(componentModules);

	const modules = transformModules(exampleModules);
	const sensitiveEx = "detectSensitiveData=(text) => (/confidential|secret/i).test(text)";
	var div = root_24();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Heading(node, {
		tag: 'h1',
		class: 'my-4 text-4xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Clipboard Manager');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Real-world examples showing how to use the selection bubble menu feature');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	ExampleWrapper(node_2, {
		get component() {
			return components["Interactive"];
		},

		get code() {
			return modules["Interactive"];
		}
	});

	var section = $.sibling(node_2, 2);
	var node_3 = $.child(section);

	Heading(node_3, {
		tag: 'h2',
		class: 'text-2xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('📚 Usage Examples');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_3, 2);
	var div_3 = $.child(div_2);
	var node_4 = $.sibling($.child(div_3), 2);

	Heading(node_4, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Enable Selection Menu');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var node_5 = $.sibling(div_3, 2);

	P(node_5, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Simplest setup - enable selection on entire page');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	HighlightCompo(node_6, {
		get code() {
			return modules["EnableSelectionMenu"];
		},
		class: 'max-w-7xl bg-white'
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_7 = $.sibling($.child(div_5), 2);

	Heading(node_7, {
		tag: 'h3',
		class: 'my-4 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Target Specific Area');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var node_8 = $.sibling(div_5, 2);

	P(node_8, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	P(node_9, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	ExampleWrapper(node_10, {
		get component() {
			return components["TargetSpecific"];
		},

		get code() {
			return modules["TargetSpecific"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.child(div_6);
	var node_11 = $.sibling($.child(div_7), 2);

	Heading(node_11, {
		tag: 'h3',
		class: 'my-4 text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Modal');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var node_12 = $.sibling(div_7, 2);

	P(node_12, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Display the clipboard manager in a modal dialog. Select any text in the paragraph to save it using the selection bubble menu.');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	P(node_13, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root_2();

			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	ExampleWrapper(node_14, {
		get component() {
			return components["WithModal"];
		},

		get code() {
			return modules["WithModal"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.child(div_8);
	var node_15 = $.sibling($.child(div_9), 2);

	Heading(node_15, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Documentation Site');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var node_16 = $.sibling(div_9, 2);

	P(node_16, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Perfect for docs where users need to save commands, code snippets, or API examples');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	P(node_17, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_3 = root_3();

			$.next(4);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	ExampleWrapper(node_18, {
		get component() {
			return components["DocumentationSite"];
		},

		get code() {
			return modules["DocumentationSite"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var node_19 = $.sibling($.child(div_11), 2);

	Heading(node_19, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Blog/Article Reader');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_11);

	var node_20 = $.sibling(div_11, 2);

	P(node_20, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Let readers save quotes, insights, or key points while reading');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_20, 2);

	P(node_21, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_4 = root_4();

			$.next(4);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_21, 2);

	ExampleWrapper(node_22, {
		get component() {
			return components["BlogReader"];
		},

		get code() {
			return modules["BlogReader"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);
	var div_13 = $.child(div_12);
	var node_23 = $.sibling($.child(div_13), 2);

	Heading(node_23, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Email Client / Support Dashboard');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.reset(div_13);

	var node_24 = $.sibling(div_13, 2);

	P(node_24, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Quick responses with ability to save new ones from actual emails');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_24, 2);

	ExampleWrapper(node_25, {
		get component() {
			return components["EmailClient"];
		},

		get code() {
			return modules["EmailClient"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var div_15 = $.child(div_14);
	var node_26 = $.sibling($.child(div_15), 2);

	Heading(node_26, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Save to Store');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_15);

	var node_27 = $.sibling(div_15, 2);

	P(node_27, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_5 = root_5();

			$.next(2);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_27, 2);

	Heading(node_28, {
		tag: 'h3',
		class: 'text-md my-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_6 = root_6();
			var code = $.sibling($.first_child(fragment_6));

			code.textContent = 'saveToStorage=true';
			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_28, 2);

	List(node_29, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_7();
			var node_30 = $.first_child(fragment_7);

			Li(node_30, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Items are automatically saved to localStorage whenever they change');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_31 = $.sibling(node_30, 2);

			Li(node_31, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('When you reload the page, all your clipboard items are restored');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_32 = $.sibling(node_31, 2);

			Li(node_32, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Data persists across browser sessions');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_33 = $.sibling(node_29, 2);

	Heading(node_33, {
		tag: 'h3',
		class: 'text-md my-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_8 = root_8();
			var code_1 = $.sibling($.first_child(fragment_8));

			code_1.textContent = 'saveToStorage=false';
			$.next();
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_33, 2);

	List(node_34, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_7();
			var node_35 = $.first_child(fragment_9);

			Li(node_35, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Items only exist in memory during the current session');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			var node_36 = $.sibling(node_35, 2);

			Li(node_36, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Refreshing the page clears all clipboard items');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_37 = $.sibling(node_36, 2);

			Li(node_37, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Data is lost when you close the tab');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_34, 2);

	ExampleWrapper(node_38, {
		get component() {
			return components["SaveToStorage"];
		},

		get code() {
			return modules["SaveToStorage"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_14);

	var div_16 = $.sibling(div_14, 2);
	var div_17 = $.child(div_16);
	var node_39 = $.sibling($.child(div_17), 2);

	Heading(node_39, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_21 = $.text('Code Editor with Snippets');

			$.append($$anchor, text_21);
		},
		$$slots: { default: true }
	});

	$.reset(div_17);

	var node_40 = $.sibling(div_17, 2);

	P(node_40, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_22 = $.text('Save frequently used code patterns directly from the editor.');

			$.append($$anchor, text_22);
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_40, 2);

	P(node_41, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_10 = root_9();
			var code_2 = $.sibling($.first_child(fragment_10));

			code_2.textContent = 'filterSensitive=false';
			$.next(3);
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_42 = $.sibling(node_41, 2);

	HighlightCompo(node_42, { code: sensitiveEx, class: 'my-2 max-w-7xl bg-white' });

	var node_43 = $.sibling(node_42, 2);

	P(node_43, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_23 = $.text('This will block texts containing "confidential" or "secret".');

			$.append($$anchor, text_23);
		},
		$$slots: { default: true }
	});

	var node_44 = $.sibling(node_43, 2);

	List(node_44, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_10();
			var node_45 = $.first_child(fragment_11);

			Li(node_45, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('Detects common sensitive information (credit cards, passwords, API keys, credentials).');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_45, 2);

			Li(node_46, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_25 = $.text('⚠️ Note: These patterns are heuristic and may produce false positives/negatives.');

					$.append($$anchor, text_25);
				},
				$$slots: { default: true }
			});

			var node_47 = $.sibling(node_46, 2);

			Li(node_47, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('Credit card regex may match any 16-digit sequence, not just valid card numbers');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_47, 2);

			Li(node_48, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_27 = $.text('Password regex is intentionally strict (12+ chars, mixed case, digits) and misses many real passwords');

					$.append($$anchor, text_27);
				},
				$$slots: { default: true }
			});

			var node_49 = $.sibling(node_48, 2);

			Li(node_49, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_28 = $.text('API key regex matches any long alphanumeric token (32+ chars), which may catch legitimate IDs');

					$.append($$anchor, text_28);
				},
				$$slots: { default: true }
			});

			var node_50 = $.sibling(node_49, 2);

			Li(node_50, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_29 = $.text('Credential keyword regex may trigger on non-secret words like "token = false"');

					$.append($$anchor, text_29);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_51 = $.sibling(node_44, 2);

	ExampleWrapper(node_51, {
		get component() {
			return components["CodeEditor"];
		},

		get code() {
			return modules["CodeEditor"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_16);

	var div_18 = $.sibling(div_16, 2);
	var div_19 = $.child(div_18);
	var node_52 = $.sibling($.child(div_19), 2);

	Heading(node_52, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_30 = $.text('Multiple Content Areas');

			$.append($$anchor, text_30);
		},
		$$slots: { default: true }
	});

	$.reset(div_19);

	var node_53 = $.sibling(div_19, 2);

	P(node_53, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_31 = $.text('Use class selector to enable selection across multiple elements');

			$.append($$anchor, text_31);
		},
		$$slots: { default: true }
	});

	var node_54 = $.sibling(node_53, 2);

	ExampleWrapper(node_54, {
		get component() {
			return components["MultipleContent"];
		},

		get code() {
			return modules["MultipleContent"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_18);

	var div_20 = $.sibling(div_18, 2);
	var div_21 = $.child(div_20);
	var node_55 = $.sibling($.child(div_21), 2);

	Heading(node_55, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_32 = $.text('No Manual Input');

			$.append($$anchor, text_32);
		},
		$$slots: { default: true }
	});

	$.reset(div_21);

	var node_56 = $.sibling(div_21, 2);

	P(node_56, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_12 = root_11();
			var code_3 = $.sibling($.first_child(fragment_12));

			code_3.textContent = 'showInput=false';
			$.next();
			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_57 = $.sibling(node_56, 2);

	ExampleWrapper(node_57, {
		get component() {
			return components["NoManualInput"];
		},

		get code() {
			return modules["NoManualInput"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_20);

	var div_22 = $.sibling(div_20, 2);
	var div_23 = $.child(div_22);
	var node_58 = $.sibling($.child(div_23), 2);

	Heading(node_58, {
		tag: 'h3',
		class: 'text-lg font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_33 = $.text('Custom Empty State');

			$.append($$anchor, text_33);
		},
		$$slots: { default: true }
	});

	$.reset(div_23);

	var node_59 = $.sibling(div_23, 2);

	P(node_59, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_34 = $.text('Provide clear instructions for first-time users');

			$.append($$anchor, text_34);
		},
		$$slots: { default: true }
	});

	var node_60 = $.sibling(node_59, 2);

	ExampleWrapper(node_60, {
		get component() {
			return components["CustomEmptyState"];
		},

		get code() {
			return modules["CustomEmptyState"];
		},
		innerClass: 'p-4'
	});

	$.reset(div_22);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_61 = $.child(section_1);

	Heading(node_61, {
		tag: 'h2',
		class: 'text-2xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_35 = $.text('💡 Best Practices');

			$.append($$anchor, text_35);
		},
		$$slots: { default: true }
	});

	var div_24 = $.sibling(node_61, 2);
	var div_25 = $.child(div_24);
	var node_62 = $.child(div_25);

	Heading(node_62, {
		tag: 'h3',
		class: 'mb-2 font-semibold text-green-900',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_36 = $.text('✅ Do');

			$.append($$anchor, text_36);
		},
		$$slots: { default: true }
	});

	var node_63 = $.sibling(node_62, 2);

	List(node_63, {
		class: 'space-y-1 text-sm text-gray-700 dark:text-gray-50',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_12();
			var node_64 = $.first_child(fragment_13);

			Li(node_64, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_37 = $.text('• Target specific content areas');

					$.append($$anchor, text_37);
				},
				$$slots: { default: true }
			});

			var node_65 = $.sibling(node_64, 2);

			Li(node_65, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_38 = $.text('• Use for text-heavy interfaces');

					$.append($$anchor, text_38);
				},
				$$slots: { default: true }
			});

			var node_66 = $.sibling(node_65, 2);

			Li(node_66, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_39 = $.text('• Combine with manual input option');

					$.append($$anchor, text_39);
				},
				$$slots: { default: true }
			});

			var node_67 = $.sibling(node_66, 2);

			Li(node_67, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_40 = $.text('• Show clear visual feedback');

					$.append($$anchor, text_40);
				},
				$$slots: { default: true }
			});

			var node_68 = $.sibling(node_67, 2);

			Li(node_68, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_41 = $.text('• Test on mobile/touch devices');

					$.append($$anchor, text_41);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var node_69 = $.child(div_26);

	Heading(node_69, {
		tag: 'h3',
		class: 'mb-2 font-semibold text-red-900',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_42 = $.text('❌ Don\'t');

			$.append($$anchor, text_42);
		},
		$$slots: { default: true }
	});

	var node_70 = $.sibling(node_69, 2);

	List(node_70, {
		class: 'space-y-1 text-sm text-gray-700 dark:text-gray-50',
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_12();
			var node_71 = $.first_child(fragment_14);

			Li(node_71, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_43 = $.text('• Enable on form inputs');

					$.append($$anchor, text_43);
				},
				$$slots: { default: true }
			});

			var node_72 = $.sibling(node_71, 2);

			Li(node_72, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_44 = $.text('• Use for tiny text snippets');

					$.append($$anchor, text_44);
				},
				$$slots: { default: true }
			});

			var node_73 = $.sibling(node_72, 2);

			Li(node_73, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_45 = $.text('• Forget mobile considerations');

					$.append($$anchor, text_45);
				},
				$$slots: { default: true }
			});

			var node_74 = $.sibling(node_73, 2);

			Li(node_74, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_46 = $.text('• Overwhelm with too many features');

					$.append($$anchor, text_46);
				},
				$$slots: { default: true }
			});

			var node_75 = $.sibling(node_74, 2);

			Li(node_75, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_47 = $.text('• Target entire page unnecessarily');

					$.append($$anchor, text_47);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_26);
	$.reset(div_24);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_76 = $.child(section_2);

	Heading(node_76, {
		tag: 'h2',
		class: 'mb-4 text-2xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_48 = $.text('🔄 Selection Menu vs Manual Input');

			$.append($$anchor, text_48);
		},
		$$slots: { default: true }
	});

	var div_27 = $.sibling(node_76, 2);
	var div_28 = $.child(div_27);
	var node_77 = $.child(div_28);

	Heading(node_77, {
		tag: 'h3',
		class: 'mb-3 flex items-center gap-2 font-semibold',
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_13();

			$.next();
			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	var node_78 = $.sibling(node_77, 2);

	List(node_78, {
		class: 'space-y-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_18();
			var node_79 = $.first_child(fragment_16);

			Li(node_79, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_17 = root_14();

					$.next(2);
					$.append($$anchor, fragment_17);
				},
				$$slots: { default: true }
			});

			var node_80 = $.sibling(node_79, 2);

			Li(node_80, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root_15();

					$.next(2);
					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			var node_81 = $.sibling(node_80, 2);

			Li(node_81, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_19 = root_16();

					$.next(2);
					$.append($$anchor, fragment_19);
				},
				$$slots: { default: true }
			});

			var node_82 = $.sibling(node_81, 2);

			Li(node_82, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_20 = root_17();

					$.next(2);
					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	$.reset(div_28);

	var div_29 = $.sibling(div_28, 2);
	var node_83 = $.child(div_29);

	Heading(node_83, {
		tag: 'h3',
		class: 'mb-3 flex items-center gap-2 font-semibold',
		children: ($$anchor, $$slotProps) => {
			var fragment_21 = root_19();

			$.next();
			$.append($$anchor, fragment_21);
		},
		$$slots: { default: true }
	});

	var node_84 = $.sibling(node_83, 2);

	List(node_84, {
		class: 'space-y-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_22 = root_18();
			var node_85 = $.first_child(fragment_22);

			Li(node_85, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_23 = root_20();

					$.next(2);
					$.append($$anchor, fragment_23);
				},
				$$slots: { default: true }
			});

			var node_86 = $.sibling(node_85, 2);

			Li(node_86, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_24 = root_21();

					$.next(2);
					$.append($$anchor, fragment_24);
				},
				$$slots: { default: true }
			});

			var node_87 = $.sibling(node_86, 2);

			Li(node_87, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_25 = root_22();

					$.next(2);
					$.append($$anchor, fragment_25);
				},
				$$slots: { default: true }
			});

			var node_88 = $.sibling(node_87, 2);

			Li(node_88, {
				class: 'flex items-start gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_26 = root_23();

					$.next(2);
					$.append($$anchor, fragment_26);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_22);
		},
		$$slots: { default: true }
	});

	$.reset(div_29);
	$.reset(div_27);
	$.next(2);
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var node_89 = $.child(section_3);

	Heading(node_89, {
		tag: 'h2',
		class: 'text-2xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_49 = $.text('Props');

			$.append($$anchor, text_49);
		},
		$$slots: { default: true }
	});

	var node_90 = $.sibling(node_89, 2);

	Table(node_90, {
		get items() {
			return clipboardManagerProps;
		},
		hoverable: true
	});

	$.reset(section_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}