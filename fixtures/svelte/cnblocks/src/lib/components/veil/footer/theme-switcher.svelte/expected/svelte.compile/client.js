import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/veil/button";
import { mode, resetMode, setMode } from "mode-watcher";
import Monitor from "@lucide/svelte/icons/monitor";
import Sun from "@lucide/svelte/icons/sun";
import Moon from "@lucide/svelte/icons/moon";
import { fade, fly, scale } from "svelte/transition";

var root = $.from_html(`<span class="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"></span>`);
var root_1 = $.from_html(`<div aria-live="polite" class="w-fit text-xs leading-none text-muted-foreground"><span> </span></div>`);
var root_2 = $.from_html(`<div class="w-fit"><div class="mb-2 -ml-2 flex"><div class="relative"><!> <!></div> <div class="relative"><!> <!></div> <div class="relative"><!> <!></div></div> <!></div>`);

export default function Theme_switcher($$anchor, $$props) {
	$.push($$props, true);

	let hoveredTheme = $.state(null);

	const selectedTheme = $.derived(() => {
		const current = mode.current;

		return current === "light" || current === "dark" || current === "system" ? current : "system";
	});

	const activeTheme = $.derived(() => $.get(hoveredTheme) ?? $.get(selectedTheme));

	const tooltipLabel = $.derived(() => {
		switch ($.get(activeTheme)) {
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
		return $.get(activeTheme) === theme;
	}

	function isSelected(theme) {
		return $.get(selectedTheme) === theme;
	}

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => isSelected("system"));
		let $1 = $.derived(() => isSelected("system") ? "text-foreground" : "");

		Button(node, {
			size: 'icon',
			variant: 'ghost',
			'aria-label': 'switch to system theme',
			get 'aria-pressed'() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},
			onmouseenter: () => $.set(hoveredTheme, "system"),
			onmouseleave: () => $.set(hoveredTheme, null),
			onfocus: () => $.set(hoveredTheme, "system"),
			onblur: () => $.set(hoveredTheme, null),
			get onclick() {
				return resetMode;
			},

			children: ($$anchor, $$slotProps) => {
				Monitor($$anchor, {});
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.transition(1, span, () => scale, () => ({ start: 0.8, duration: 120 }));
			$.transition(2, span, () => scale, () => ({ start: 1, duration: 120 }));
			$.append($$anchor, span);
		};

		var d = $.derived(() => isActive("system"));

		$.if(node_1, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	{
		let $0 = $.derived(() => isSelected("light"));
		let $1 = $.derived(() => isSelected("light") ? "text-foreground" : "");

		Button(node_2, {
			size: 'icon',
			variant: 'ghost',
			'aria-label': 'switch to light theme',
			get 'aria-pressed'() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},
			onmouseenter: () => $.set(hoveredTheme, "light"),
			onmouseleave: () => $.set(hoveredTheme, null),
			onfocus: () => $.set(hoveredTheme, "light"),
			onblur: () => $.set(hoveredTheme, null),
			onclick: () => setMode("light"),
			children: ($$anchor, $$slotProps) => {
				Sun($$anchor, {});
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span_1 = root();

			$.transition(1, span_1, () => scale, () => ({ start: 0.8, duration: 120 }));
			$.transition(2, span_1, () => scale, () => ({ start: 1, duration: 120 }));
			$.append($$anchor, span_1);
		};

		var d_1 = $.derived(() => isActive("light"));

		$.if(node_3, ($$render) => {
			if ($.get(d_1)) $$render(consequent_1);
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	{
		let $0 = $.derived(() => isSelected("dark"));
		let $1 = $.derived(() => isSelected("dark") ? "text-foreground" : "");

		Button(node_4, {
			size: 'icon',
			variant: 'ghost',
			'aria-label': 'switch to dark theme',
			get 'aria-pressed'() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},
			onmouseenter: () => $.set(hoveredTheme, "dark"),
			onmouseleave: () => $.set(hoveredTheme, null),
			onfocus: () => $.set(hoveredTheme, "dark"),
			onblur: () => $.set(hoveredTheme, null),
			onclick: () => setMode("dark"),
			children: ($$anchor, $$slotProps) => {
				Moon($$anchor, {});
			},
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_2 = ($$anchor) => {
			var span_2 = root();

			$.transition(1, span_2, () => scale, () => ({ start: 0.8, duration: 120 }));
			$.transition(2, span_2, () => scale, () => ({ start: 1, duration: 120 }));
			$.append($$anchor, span_2);
		};

		var d_2 = $.derived(() => isActive("dark"));

		$.if(node_5, ($$render) => {
			if ($.get(d_2)) $$render(consequent_2);
		});
	}

	$.reset(div_4);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_5 = root_1();
			var span_3 = $.child(div_5);
			var text = $.only_child(span_3, true);

			$.reset(div_5);
			$.template_effect(() => $.set_text(text, $.get(tooltipLabel)));
			$.transition(1, span_3, () => fly, () => ({ y: 3, duration: 150 }));
			$.transition(2, span_3, () => fly, () => ({ y: -2, duration: 120 }));
			$.transition(1, div_5, () => fade, () => ({ duration: 150 }));
			$.transition(2, div_5, () => fade, () => ({ duration: 120 }));
			$.append($$anchor, div_5);
		};

		$.if(node_6, ($$render) => {
			if ($.get(hoveredTheme)) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}