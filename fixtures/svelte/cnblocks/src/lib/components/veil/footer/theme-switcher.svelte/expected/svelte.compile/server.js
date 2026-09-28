import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/veil/button";
import { mode, resetMode, setMode } from "mode-watcher";
import Monitor from "@lucide/svelte/icons/monitor";
import Sun from "@lucide/svelte/icons/sun";
import Moon from "@lucide/svelte/icons/moon";
import { fade, fly, scale } from "svelte/transition";

export default function Theme_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hoveredTheme = null;

		const selectedTheme = $.derived(() => {
			const current = mode.current;

			return current === "light" || current === "dark" || current === "system" ? current : "system";
		});

		const activeTheme = $.derived(() => hoveredTheme ?? selectedTheme());

		const tooltipLabel = $.derived(() => {
			switch (activeTheme()) {
				case "light":
					return "Switch to light theme";

				case "dark":
					return "Switch to dark theme";

				case "system":

				default:
					return "Switch to system theme";
			}
		});

		function isActive(theme) {
			return activeTheme() === theme;
		}

		function isSelected(theme) {
			return selectedTheme() === theme;
		}

		$$renderer.push(`<div class="w-fit"><div class="mb-2 -ml-2 flex"><div class="relative">`);

		Button($$renderer, {
			size: 'icon',
			variant: 'ghost',
			'aria-label': 'switch to system theme',
			'aria-pressed': isSelected("system"),
			class: isSelected("system") ? "text-foreground" : "",
			onmouseenter: () => hoveredTheme = "system",
			onmouseleave: () => hoveredTheme = null,
			onfocus: () => hoveredTheme = "system",
			onblur: () => hoveredTheme = null,
			onclick: resetMode,
			children: ($$renderer) => {
				Monitor($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (isActive("system")) {
			$$renderer.push(`<!--[0--><span class="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="relative">`);

		Button($$renderer, {
			size: 'icon',
			variant: 'ghost',
			'aria-label': 'switch to light theme',
			'aria-pressed': isSelected("light"),
			class: isSelected("light") ? "text-foreground" : "",
			onmouseenter: () => hoveredTheme = "light",
			onmouseleave: () => hoveredTheme = null,
			onfocus: () => hoveredTheme = "light",
			onblur: () => hoveredTheme = null,
			onclick: () => setMode("light"),
			children: ($$renderer) => {
				Sun($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (isActive("light")) {
			$$renderer.push(`<!--[0--><span class="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="relative">`);

		Button($$renderer, {
			size: 'icon',
			variant: 'ghost',
			'aria-label': 'switch to dark theme',
			'aria-pressed': isSelected("dark"),
			class: isSelected("dark") ? "text-foreground" : "",
			onmouseenter: () => hoveredTheme = "dark",
			onmouseleave: () => hoveredTheme = null,
			onfocus: () => hoveredTheme = "dark",
			onblur: () => hoveredTheme = null,
			onclick: () => setMode("dark"),
			children: ($$renderer) => {
				Moon($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (isActive("dark")) {
			$$renderer.push(`<!--[0--><span class="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (hoveredTheme) {
			$$renderer.push(`<!--[0--><div aria-live="polite" class="w-fit text-xs leading-none text-muted-foreground"><span>${$.escape(tooltipLabel())}</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}