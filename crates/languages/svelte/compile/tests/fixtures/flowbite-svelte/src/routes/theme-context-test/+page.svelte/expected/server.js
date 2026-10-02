import * as $ from 'svelte/internal/server';
import { Button, ThemeProvider } from "$lib";

export default function _page($$renderer) {
	// Test 1: Component without ThemeProvider (should use defaults)
	// Test 2: Component with ThemeProvider (should use custom theme)
	const customTheme = { button: { base: "custom-button-class" } };

	$$renderer.push(`<div class="space-y-8 p-8"><section><h2 class="mb-4 text-xl font-bold">Test 1: Without ThemeProvider</h2> <p class="mb-2 text-gray-600">Should render with default theme</p> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default Button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section> <section><h2 class="mb-4 text-xl font-bold">Test 2: With ThemeProvider</h2> <p class="mb-2 text-gray-600">Should render with custom theme class</p> `);

	ThemeProvider($$renderer, {
		theme: customTheme,
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Custom Themed Button`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section> <section><h2 class="mb-4 text-xl font-bold">Test 3: Multiple components in provider</h2> <p class="mb-2 text-gray-600">All should use custom theme</p> `);

	ThemeProvider($$renderer, {
		theme: customTheme,
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-4">`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button 1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'blue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button 3`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section></div>`);
}