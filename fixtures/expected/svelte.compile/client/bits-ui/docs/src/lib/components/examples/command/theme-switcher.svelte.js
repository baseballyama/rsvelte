import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { crossfade } from "svelte/transition";
import { cubicInOut } from "svelte/easing";
import { FramerIcon, LinearIcon, RaycastIcon, VercelIcon } from "./icons/index.js";

var root = $.from_html(`<div class="activeTheme"></div>`);
var root_1 = $.from_html(`<button><!> <!></button>`);
var root_2 = $.from_html(`<div class="switcher"><span class="arrow">←</span> <!> <span class="arrow">→</span></div>`);

export default function Theme_switcher($$anchor, $$props) {
	$.push($$props, true);

	let theme = $.prop($$props, 'theme', 15, "raycast");
	let showArrowKeyHint = $.state(false);

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
			const currentIndex = themeNames.indexOf(theme());
			const nextIndex = currentIndex + 1;
			const nextTheme = themeNames[nextIndex];

			if (isTheme(nextTheme)) {
				theme(nextTheme);
			}
		}

		if (e.key === "ArrowLeft") {
			const currentIndex = themeNames.indexOf(theme());
			const nextIndex = currentIndex - 1;
			const nextTheme = themeNames[nextIndex];

			if (isTheme(nextTheme)) {
				theme(nextTheme);
			}
		}
	}

	function handleButtonClick(key) {
		theme(key);

		if ($.get(showArrowKeyHint) === false) {
			$.set(showArrowKeyHint, true);
		}
	}

	const [send, receive] = crossfade({ duration: 250, easing: cubicInOut });
	var div = root_2();

	$.event('keydown', $.document, handleKeydown);

	var span = $.child(div);

	$.set_style(span, '', {}, {
		left: '100px',
		transform: 'translateX(-24px) translateZ(0px)'
	});

	var node = $.sibling(span, 2);

	$.each(node, 17, () => themes, ({ key, icon }) => key, ($$anchor, $$item) => {
		let key = () => $.get($$item).key;
		let icon = () => $.get($$item).icon;
		const isActive = $.derived(() => theme() === key());
		const Icon = $.derived(icon);
		var button = root_1();
		var node_1 = $.child(button);

		$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
			Icon_1($$anchor, {});
		});

		var text = $.sibling(node_1);
		var node_2 = $.sibling(text);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();

				$.transition(1, div_1, () => send, () => ({ key: "active" }));
				$.transition(2, div_1, () => receive, () => ({ key: "active" }));
				$.append($$anchor, div_1);
			};

			$.if(node_2, ($$render) => {
				if ($.get(isActive)) $$render(consequent);
			});
		}

		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'data-selected', $.get(isActive));
			$.set_text(text, ` ${key() ?? ''} `);
		});

		$.delegated('click', button, () => handleButtonClick(key()));
		$.append($$anchor, button);
	});

	var span_1 = $.sibling(node, 2);

	$.set_style(span_1, '', {}, {
		right: '100px',
		transform: 'translateX(20px) translateZ(0px)'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);