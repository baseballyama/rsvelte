import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { darkmode } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'lightIcon',
	'darkIcon',
	'size',
	'ariaLabel'
]);

var root = $.with_script($.from_html(
	`<script lang="ts">
    if ("THEME_PREFERENCE_KEY" in localStorage) {
      localStorage.getItem("THEME_PREFERENCE_KEY") === "dark" ? window.document.documentElement.classList.add("dark") : window.document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) window.document.documentElement.classList.add("dark");
    }
  </script><!>`,
	1
));

var root_1 = $.from_svg(`<svg role="img" aria-label="Light mode" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1
    0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`);

var root_2 = $.from_svg(`<svg role="img" aria-label="Dark mode" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>`);
var root_3 = $.from_html(`<button><span class="hidden dark:block"><!></span> <span class="block dark:hidden"><!></span></button>`);

export default function DarkMode($$anchor, $$props) {
	$.push($$props, true);

	// const THEME_PREFERENCE_KEY = 'color-theme';
	let size = $.prop($$props, 'size', 3, "md"),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "Dark mode"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("darkmode"));
	const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

	const toggleTheme = (ev) => {
		const target = ev.target;
		const isDark = target.ownerDocument.documentElement.classList.toggle("dark");

		if (target.ownerDocument === document) // we are NOT in the iFrame
		localStorage.setItem("THEME_PREFERENCE_KEY", isDark ? "dark" : "light");
	};

	var button = root_3();

	$.head('1mdv2j2', ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment));

		$.append($$anchor, fragment);
	});

	$.attribute_effect(
		button,
		($0) => ({
			onclick: toggleTheme,
			'aria-label': ariaLabel(),
			type: 'button',
			...restProps,
			class: $0,
			tabindex: 0
		}),
		[() => darkmode({ class: clsx($.get(theme), $$props.class) })]
	);

	var span = $.child(button);
	var node_1 = $.child(span);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.lightIcon);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var svg = root_1();

			$.template_effect(() => $.set_class(svg, 0, $.clsx(sizes[size()])));
			$.append($$anchor, svg);
		};

		$.if(node_1, ($$render) => {
			if ($$props.lightIcon) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(span);

	var span_1 = $.sibling(span, 2);
	var node_3 = $.child(span_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.snippet(node_4, () => $$props.darkIcon);
			$.append($$anchor, fragment_2);
		};

		var alternate_1 = ($$anchor) => {
			var svg_1 = root_2();

			$.template_effect(() => $.set_class(svg_1, 0, $.clsx(sizes[size()])));
			$.append($$anchor, svg_1);
		};

		$.if(node_3, ($$render) => {
			if ($$props.darkIcon) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(span_1);
	$.reset(button);
	$.append($$anchor, button);
	$.pop();
}