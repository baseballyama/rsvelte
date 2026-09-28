import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CommandPalette, Toggle } from "$lib";
import { goto } from "$app/navigation";

var root = $.from_html(`<span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"> </span>`);
var root_1 = $.from_html(`<div class="mt-2 flex flex-wrap gap-1"></div>`);
var root_2 = $.from_html(`<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"><div class="flex items-start gap-3"><span class="text-2xl"> </span> <div><h3 class="font-semibold text-gray-900 dark:text-white"> </h3> <p class="text-sm text-gray-600 dark:text-gray-400"> </p> <!></div></div></div>`);
var root_3 = $.from_html(`<div class="min-h-screen bg-gray-50 p-8 dark:bg-gray-900"><div class="mx-auto max-w-4xl"><h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Command Palette Demo</h1> <p class="mb-8 text-gray-600 dark:text-gray-400">Press <kbd class="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-800">⌘P (default ⌘K)</kbd> or <kbd class="rounded bg-gray-200 px-2 py-1 font-mono text-sm dark:bg-gray-800">Ctrl+P (default Ctrl+K)</kbd> to open the command palette, or click the button below.</p> <button class="bg-primary-600 hover:bg-primary-700 mb-4 rounded-lg px-6 py-3 font-medium text-white transition-colors">Open Command Palette</button> <!> <div class="mt-12 space-y-6"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Available Commands</h2> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"></div></div></div></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let paletteOpen = $.state(false);
	let vimMode = $.state(false);

	const handleVimToggle = () => {
		$.set(vimMode, !$.get(vimMode));
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

	var fragment = root_3();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var button = $.sibling($.child(div_1), 4);
	var node = $.sibling(button, 2);

	Toggle(node, {
		get checked() {
			return $.get(vimMode);
		},
		onclick: handleVimToggle,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Vim mode is ${$.get(vimMode) ? "on" : "off"}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node, 2);
	var div_3 = $.sibling($.child(div_2), 2);

	$.each(div_3, 21, () => commands, (command) => command.id, ($$anchor, command) => {
		var div_4 = root_2();
		var div_5 = $.child(div_4);
		var span = $.child(div_5);
		var text_1 = $.only_child(span, true);
		var div_6 = $.sibling(span, 2);
		var h3 = $.child(div_6);
		var text_2 = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_3 = $.only_child(p, true);
		var node_1 = $.sibling(p, 2);

		{
			var consequent = ($$anchor) => {
				var div_7 = root_1();

				$.each(div_7, 20, () => $.get(command).keywords, (keyword) => keyword, ($$anchor, keyword) => {
					var span_1 = root();
					var text_4 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_4, keyword));
					$.append($$anchor, span_1);
				});

				$.reset(div_7);
				$.append($$anchor, div_7);
			};

			$.if(node_1, ($$render) => {
				if ($.get(command).keywords) $$render(consequent);
			});
		}

		$.reset(div_6);
		$.reset(div_5);
		$.reset(div_4);

		$.template_effect(() => {
			$.set_text(text_1, $.get(command).icon);
			$.set_text(text_2, $.get(command).label);
			$.set_text(text_3, $.get(command).description);
		});

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	CommandPalette(node_2, {
		get items() {
			return commands;
		},
		shortcutKey: 'p',
		get vim() {
			return $.get(vimMode);
		},

		get open() {
			return $.get(paletteOpen);
		},

		set open($$value) {
			$.set(paletteOpen, $$value, true);
		}
	});

	$.delegated('click', button, () => $.set(paletteOpen, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);