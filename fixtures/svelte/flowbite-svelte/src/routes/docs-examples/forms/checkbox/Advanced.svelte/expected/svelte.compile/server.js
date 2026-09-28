import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";
import React from "$icons/React.svelte";
import Vue from "$icons/Vue.svelte";
import Angular from "$icons/Angular.svelte";

export default function Advanced($$renderer) {
	$$renderer.push(`<p class="mb-5 text-lg font-medium text-gray-900 dark:text-white">Choose technology:</p> <div class="grid w-full gap-6 md:grid-cols-3">`);

	Checkbox($$renderer, {
		custom: true,
		children: ($$renderer) => {
			$$renderer.push(`<div class="peer-checked:border-primary-600 w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 font-normal text-gray-500 peer-checked:text-gray-600 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300">`);
			React($$renderer, {});
			$$renderer.push(`<!----> <div class="w-full text-lg font-semibold">React Js</div> <div class="w-full text-sm">A JavaScript library for building user interfaces.</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		custom: true,
		children: ($$renderer) => {
			$$renderer.push(`<div class="peer-checked:border-primary-600 w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 font-normal text-gray-500 peer-checked:text-gray-600 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300">`);
			Vue($$renderer, {});
			$$renderer.push(`<!----> <div class="w-full text-lg font-semibold">Vue Js</div> <div class="w-full text-sm">Vue.js is an model–view front end JavaScript framework.</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		custom: true,
		children: ($$renderer) => {
			$$renderer.push(`<div class="peer-checked:border-primary-600 w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 font-normal text-gray-500 peer-checked:text-gray-600 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300">`);
			Angular($$renderer, {});
			$$renderer.push(`<!----> <div class="w-full text-lg font-semibold">Angular</div> <div class="w-full text-sm">A TypeScript-based web application framework.</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}