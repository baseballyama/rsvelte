import * as $ from 'svelte/internal/server';
import { CommandPalette, Toggle } from "$lib";
import { goto } from "$app/navigation";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let paletteOpen = false;
		let vimMode = false;

		const handleVimToggle = () => {
			vimMode = !vimMode;
		};

		const commands = [
			{
				id: "new-file",
				label: "New File",
				description: "Create a new file",
				icon: "📄",
				keywords: ["create", "add"],
				onselect: () => console.log("New file created")
			},

			{
				id: "open-file",
				label: "Open File",
				description: "Open an existing file",
				icon: "📂",
				keywords: ["browse", "load"],
				onselect: () => console.log("Opening file picker")
			},

			{
				id: "save",
				label: "Save",
				description: "Save current file",
				icon: "💾",
				keywords: ["write", "store"],
				onselect: () => console.log("File saved")
			},

			{
				id: "settings",
				label: "Settings",
				description: "Open application settings",
				icon: "⚙️",
				keywords: ["preferences", "config", "options"],
				onselect: () => goto("/")
			},

			{
				id: "search",
				label: "Search in Files",
				description: "Search across all files",
				icon: "🔍",
				keywords: ["find", "grep", "locate"],
				onselect: () => console.log("Opening search")
			},

			{
				id: "theme-light",
				label: "Switch to Light Theme",
				description: "Change appearance to light mode",
				icon: "☀️",
				keywords: ["theme", "appearance", "bright"],
				onselect: () => document.documentElement.classList.remove("dark")
			},

			{
				id: "theme-dark",
				label: "Switch to Dark Theme",
				description: "Change appearance to dark mode",
				icon: "🌙",
				keywords: ["theme", "appearance", "night"],
				onselect: () => document.documentElement.classList.add("dark")
			},

			{
				id: "help",
				label: "Help & Documentation",
				description: "View help documentation",
				icon: "❓",
				keywords: ["docs", "support", "guide"],
				onselect: () => goto("/docs/pages/introduction")
			},

			{
				id: "shortcuts",
				label: "Keyboard Shortcuts",
				description: "View all keyboard shortcuts",
				icon: "⌨️",
				keywords: ["keys", "hotkeys", "commands"],
				onselect: () => console.log("Showing shortcuts")
			},

			{
				id: "profile",
				label: "View Profile",
				description: "Go to your profile page",
				icon: "👤",
				keywords: ["user", "account", "me"],
				onselect: () => window.location.href = "/profile"
			},

			{
				id: "notifications",
				label: "Notifications",
				description: "View your notifications",
				icon: "🔔",
				keywords: ["alerts", "updates", "messages"],
				onselect: () => console.log("Opening notifications")
			},

			{
				id: "export",
				label: "Export Data",
				description: "Export your data as JSON",
				icon: "📤",
				keywords: ["download", "backup", "save"],
				onselect: () => console.log("Exporting data")
			},

			{
				id: "import",
				label: "Import Data",
				description: "Import data from file",
				icon: "📥",
				keywords: ["upload", "restore", "load"],
				onselect: () => console.log("Opening import dialog")
			},

			{
				id: "print",
				label: "Print",
				description: "Print current page",
				icon: "🖨️",
				keywords: ["printer", "paper"],
				onselect: () => window.print()
			},

			{
				id: "logout",
				label: "Log Out",
				description: "Sign out of your account",
				icon: "🚪",
				keywords: ["signout", "exit", "leave"],
				onselect: () => console.log("Logging out")
			}
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="min-h-screen bg-gray-50 p-8 dark:bg-gray-900"><div class="mx-auto max-w-4xl"><h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Command Palette Demo</h1> <p class="mb-8 text-gray-600 dark:text-gray-400">Press <kbd class="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-800">⌘P (default ⌘K)</kbd> or <kbd class="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-800">Ctrl+P (default Ctrl+K)</kbd> to open the command palette, or click the button below.</p> <button class="bg-primary-600 hover:bg-primary-700 mb-4 rounded-lg px-6 py-3 font-medium text-white transition-colors">Open Command Palette</button> `);

			Toggle($$renderer, {
				checked: vimMode,
				onclick: handleVimToggle,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Vim mode is ${$.escape(vimMode ? "on" : "off")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-12 space-y-6"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Available Commands</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><!--[-->`);

			const each_array = $.ensure_array_like(commands);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let command = each_array[$$index_1];

				$$renderer.push(`<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"><div class="flex items-start gap-3"><span class="text-2xl">${$.escape(command.icon)}</span> <div><h3 class="font-semibold text-gray-900 dark:text-white">${$.escape(command.label)}</h3> <p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(command.description)}</p> `);

				if (command.keywords) {
					$$renderer.push(`<!--[0--><div class="mt-2 flex flex-wrap gap-1"><!--[-->`);

					const each_array_1 = $.ensure_array_like(command.keywords);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let keyword = each_array_1[$$index];

						$$renderer.push(`<span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">${$.escape(keyword)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div></div> `);

			CommandPalette($$renderer, {
				items: commands,
				shortcutKey: 'p',
				vim: vimMode,
				get open() {
					return paletteOpen;
				},

				set open($$value) {
					paletteOpen = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}