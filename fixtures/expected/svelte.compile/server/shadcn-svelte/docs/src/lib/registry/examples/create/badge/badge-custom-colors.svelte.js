import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Badge_custom_colors($$renderer) {
	Example($$renderer, {
		title: 'Custom Colors',
		class: 'max-w-fit',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap gap-2">`);

			Badge($$renderer, {
				class: 'bg-blue-600 text-blue-50 dark:bg-blue-600 dark:text-blue-50',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Blue`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-green-600 text-green-50 dark:bg-green-600 dark:text-green-50',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Green`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-sky-600 text-sky-50 dark:bg-sky-600 dark:text-sky-50',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sky`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-purple-600 text-purple-50 dark:bg-purple-600 dark:text-purple-50',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Purple`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Blue`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Green`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sky`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Purple`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				class: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Red`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}