import * as $ from 'svelte/internal/server';
import { DarkMode } from "flowbite-svelte";

export default function Switcher($$renderer) {
	DarkMode($$renderer, {
		class: 'text-primary-500 dark:text-primary-600 border dark:border-gray-800'
	});
}