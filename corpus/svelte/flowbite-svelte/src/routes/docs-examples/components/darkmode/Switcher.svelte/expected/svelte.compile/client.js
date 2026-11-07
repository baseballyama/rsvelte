import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DarkMode } from "flowbite-svelte";

export default function Switcher($$anchor) {
	DarkMode($$anchor, {
		class: 'text-primary-500 dark:text-primary-600 border dark:border-gray-800'
	});
}