import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";
import React from "$icons/React.svelte";
import Vue from "$icons/Vue.svelte";
import Angular from "$icons/Angular.svelte";

var root = $.from_html(`<div class="peer-checked:border-primary-600 w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 font-normal text-gray-500 peer-checked:text-gray-600 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300"><!> <div class="w-full text-lg font-semibold">React Js</div> <div class="w-full text-sm">A JavaScript library for building user interfaces.</div></div>`);
var root_1 = $.from_html(`<div class="peer-checked:border-primary-600 w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 font-normal text-gray-500 peer-checked:text-gray-600 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300"><!> <div class="w-full text-lg font-semibold">Vue Js</div> <div class="w-full text-sm">Vue.js is an model–view front end JavaScript framework.</div></div>`);
var root_2 = $.from_html(`<div class="peer-checked:border-primary-600 w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-5 font-normal text-gray-500 peer-checked:text-gray-600 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-300"><!> <div class="w-full text-lg font-semibold">Angular</div> <div class="w-full text-sm">A TypeScript-based web application framework.</div></div>`);
var root_3 = $.from_html(`<p class="mb-5 text-lg font-medium text-gray-900 dark:text-white">Choose technology:</p> <div class="grid w-full gap-6 md:grid-cols-3"><!> <!> <!></div>`, 1);

export default function Advanced($$anchor) {
	var fragment = root_3();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	Checkbox(node, {
		custom: true,
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			React(node_1, {});
			$.next(4);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Checkbox(node_2, {
		custom: true,
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();
			var node_3 = $.child(div_2);

			Vue(node_3, {});
			$.next(4);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Checkbox(node_4, {
		custom: true,
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_2();
			var node_5 = $.child(div_3);

			Angular(node_5, {});
			$.next(4);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}