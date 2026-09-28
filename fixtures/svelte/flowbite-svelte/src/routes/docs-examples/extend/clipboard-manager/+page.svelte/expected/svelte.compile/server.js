import * as $ from 'svelte/internal/server';

import {
	ExampleWrapper,
	HighlightCompo,
	transformComponents,
	transformModules
} from "svelte-rune-highlight";

import { Table } from "$lib";
import { clipboardManagerProps } from "./clipboardManagerProps";
import { List, Li, P, Heading } from "$lib";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const componentModules = import.meta.glob("./examples/*.svelte", { eager: true });

		// Import source code
		const exampleModules = import.meta.glob("./examples/*.svelte", { query: "?raw", import: "default", eager: true });

		// Transform both using helper functions
		const components = transformComponents(componentModules);

		const modules = transformModules(exampleModules);
		const sensitiveEx = "detectSensitiveData=(text) => (/confidential|secret/i).test(text)";

		$$renderer.push(`<div class="mx-auto max-w-7xl space-y-8 p-6"><div class="space-y-2">`);

		Heading($$renderer, {
			tag: 'h1',
			class: 'my-4 text-4xl',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clipboard Manager`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Real-world examples showing how to use the selection bubble menu feature`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		ExampleWrapper($$renderer, {
			component: components["Interactive"],
			code: modules["Interactive"]
		});

		$$renderer.push(`<!----> <section class="space-y-6">`);

		Heading($$renderer, {
			tag: 'h2',
			class: 'text-2xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->📚 Usage Examples`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Basic</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Enable Selection Menu`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Simplest setup - enable selection on entire page`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		HighlightCompo($$renderer, {
			code: modules["EnableSelectionMenu"],
			class: 'max-w-7xl bg-white'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Targeted</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'my-4 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Target Specific Area`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Limit selection menu to specific content area using CSS selector using <code class="text-primary-700 font-bold">selectionTarget</code> prop.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use <code class="text-primary-700 font-bold">enableSelectionMenu</code> to show selection bubble menu.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["TargetSpecific"],
			code: modules["TargetSpecific"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Modal</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'my-4 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Display the clipboard manager in a modal dialog. Select any text in the paragraph to save it using the selection bubble menu.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set <code class="text-primary-700 font-bold">storageKey</code> to customize the localStorage key name.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["WithModal"],
			code: modules["WithModal"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Documentation</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Documentation Site`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Perfect for docs where users need to save commands, code snippets, or API examples`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use <code class="text-primary-700 font-bold">items</code> prop to set initial value. Use <code class="text-primary-700 font-bold">limit</code> prop to set max items to store.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["DocumentationSite"],
			code: modules["DocumentationSite"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">Content</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Blog/Article Reader`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Let readers save quotes, insights, or key points while reading`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use <code class="text-primary-700 font-bold">saveLabel</code> and <code class="text-primary-700 font-bold">clearLabel</code> to change labels.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["BlogReader"],
			code: modules["BlogReader"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-800">Support</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Email Client / Support Dashboard`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Quick responses with ability to save new ones from actual emails`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["EmailClient"],
			code: modules["EmailClient"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">localStorage</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Save to Store`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->The <code class="text-primary-700">saveToStorage</code> prop controls whether the clipboard items are saved to localStorage so they survive page refreshes and browser sessions.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-md my-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->When <code class="text-primary-700">saveToStorage=true</code> (default):`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			children: ($$renderer) => {
				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Items are automatically saved to localStorage whenever they change`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->When you reload the page, all your clipboard items are restored`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Data persists across browser sessions`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-md my-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->When <code class="text-primary-700">saveToStorage=false</code> :`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			children: ($$renderer) => {
				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Items only exist in memory during the current session`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Refreshing the page clears all clipboard items`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Data is lost when you close the tab`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["SaveToStorage"],
			code: modules["SaveToStorage"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">Developer</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Code Editor with Snippets`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Save frequently used code patterns directly from the editor.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use <code class="text-primary-700">filterSensitive=false</code> to unblock sensitive data such as password pattern, api token pattern, etc. The component provide default function (see below) to detect sensitive data. However use the <code class="text-primary-700">detectSensitiveData</code> prop to provide your own logic.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		HighlightCompo($$renderer, { code: sensitiveEx, class: 'my-2 max-w-7xl bg-white' });
		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->This will block texts containing "confidential" or "secret".`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			children: ($$renderer) => {
				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Detects common sensitive information (credit cards, passwords, API keys, credentials).`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->⚠️ Note: These patterns are heuristic and may produce false positives/negatives.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Credit card regex may match any 16-digit sequence, not just valid card numbers`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Password regex is intentionally strict (12+ chars, mixed case, digits) and misses many real passwords`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->API key regex matches any long alphanumeric token (32+ chars), which may catch legitimate IDs`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Credential keyword regex may trigger on non-secret words like "token = false"`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["CodeEditor"],
			code: modules["CodeEditor"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">Advanced</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Multiple Content Areas`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use class selector to enable selection across multiple elements`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["MultipleContent"],
			code: modules["MultipleContent"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Selection Only</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->No Manual Input`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use <code class="text-primary-700">showInput=false</code> to hide the input box and use only selection menu with custom rendering`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["NoManualInput"],
			code: modules["NoManualInput"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div> <div class="space-y-3 rounded-lg p-6 shadow"><div class="flex items-center gap-3"><span class="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">Custom</span> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Custom Empty State`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			class: 'text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Provide clear instructions for first-time users`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ExampleWrapper($$renderer, {
			component: components["CustomEmptyState"],
			code: modules["CustomEmptyState"],
			innerClass: 'p-4'
		});

		$$renderer.push(`<!----></div></section> <section class="space-y-4 rounded-lg p-6 shadow">`);

		Heading($$renderer, {
			tag: 'h2',
			class: 'text-2xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->💡 Best Practices`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div class="border-l-4 border-green-500 pl-4">`);

		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-2 font-semibold text-green-900',
			children: ($$renderer) => {
				$$renderer.push(`<!---->✅ Do`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			class: 'space-y-1 text-sm text-gray-700 dark:text-gray-50',
			children: ($$renderer) => {
				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Target specific content areas`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Use for text-heavy interfaces`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Combine with manual input option`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Show clear visual feedback`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Test on mobile/touch devices`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="border-l-4 border-red-500 pl-4">`);

		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-2 font-semibold text-red-900',
			children: ($$renderer) => {
				$$renderer.push(`<!---->❌ Don't`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			class: 'space-y-1 text-sm text-gray-700 dark:text-gray-50',
			children: ($$renderer) => {
				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Enable on form inputs`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Use for tiny text snippets`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Forget mobile considerations`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Overwhelm with too many features`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->• Target entire page unnecessarily`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></section> <section class="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6">`);

		Heading($$renderer, {
			tag: 'h2',
			class: 'mb-4 text-2xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->🔄 Selection Menu vs Manual Input`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="grid grid-cols-1 gap-6 md:grid-cols-2"><div class="rounded-lg p-4">`);

		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-3 flex items-center gap-2 font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<span class="text-2xl">👆</span> Selection Menu`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			class: 'space-y-2 text-sm',
			children: ($$renderer) => {
				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>Faster for existing content</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>No context switching</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>Natural workflow</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>Works on mobile</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="rounded-lg p-4">`);

		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-3 flex items-center gap-2 font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<span class="text-2xl">⌨️</span> Manual Input`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		List($$renderer, {
			class: 'space-y-2 text-sm',
			children: ($$renderer) => {
				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>Create new snippets</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>Edit before saving</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>Paste from external sources</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Li($$renderer, {
					class: 'flex items-start gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-green-500">✓</span> <span>More control</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <p class="mt-4 text-center text-sm text-gray-600">💡 <strong>Pro tip:</strong> Enable both for maximum flexibility!</p></section> <section class="space-y-6">`);

		Heading($$renderer, {
			tag: 'h2',
			class: 'text-2xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Props`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		Table($$renderer, { items: clipboardManagerProps, hoverable: true });
		$$renderer.push(`<!----></section></div>`);
	});
}