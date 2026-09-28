import * as $ from 'svelte/internal/server';
import { crossfade } from "svelte/transition";
import { cubicInOut } from "svelte/easing";
import { FramerIcon, LinearIcon, RaycastIcon, VercelIcon } from "./icons/index.js";

export default function Theme_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { theme = "raycast" } = $$props;
		let showArrowKeyHint = false;

		function isTheme(value) {
			return typeof value === "string" && ["raycast", "linear", "vercel", "framer"].includes(value);
		}

		const themes = [
			{ icon: RaycastIcon, key: "raycast" },
			{ icon: LinearIcon, key: "linear" },
			{ icon: VercelIcon, key: "vercel" },
			{ icon: FramerIcon, key: "framer" }
		];

		function handleKeydown(e) {
			const themeNames = themes.map(({ key }) => key);

			if (e.key === "ArrowRight") {
				const currentIndex = themeNames.indexOf(theme);
				const nextIndex = currentIndex + 1;
				const nextTheme = themeNames[nextIndex];

				if (isTheme(nextTheme)) {
					theme = nextTheme;
				}
			}

			if (e.key === "ArrowLeft") {
				const currentIndex = themeNames.indexOf(theme);
				const nextIndex = currentIndex - 1;
				const nextTheme = themeNames[nextIndex];

				if (isTheme(nextTheme)) {
					theme = nextTheme;
				}
			}
		}

		function handleButtonClick(key) {
			theme = key;

			if (showArrowKeyHint === false) {
				showArrowKeyHint = true;
			}
		}

		const [send, receive] = crossfade({ duration: 250, easing: cubicInOut });

		$$renderer.push(`<div class="switcher"><span class="arrow"${$.attr_style('', {
			left: '100px',
			transform: 'translateX(-24px) translateZ(0px)'
		})}>←</span> <!--[-->`);

		const each_array = $.ensure_array_like(themes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { key, icon } = each_array[$$index];
			const isActive = theme === key;
			const Icon = icon;

			$$renderer.push(`<button${$.attr('data-selected', isActive)}>`);

			if (Icon) {
				$$renderer.push('<!--[-->');
				Icon($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` ${$.escape(key)} `);

			if (isActive) {
				$$renderer.push(`<!--[0--><div class="activeTheme"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--> <span class="arrow"${$.attr_style('', {
			right: '100px',
			transform: 'translateX(20px) translateZ(0px)'
		})}>→</span></div>`);

		$.bind_props($$props, { theme });
	});
}