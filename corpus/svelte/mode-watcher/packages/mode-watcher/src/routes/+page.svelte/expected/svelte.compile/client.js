import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mode,
	resetMode,
	setMode,
	systemPrefersMode,
	theme,
	toggleMode,
	userPrefersMode
} from "$lib/index.js";

import { isBrowser } from "$lib/utils.js";

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<div class="container space-y-4 py-12"><p> </p> <p> </p> <p> </p> <p> </p> <!> <!> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Toggle</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Light Mode</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Dark Mode</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">System Mode</button> <button class="bg-primary text-background rounded-sm px-2 py-1 transition-colors duration-500">Reset</button></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const htmlElement = $.derived(() => {
		mode.current;
		theme.current;

		if (!isBrowser) return;

		const htmlElement = document.documentElement;

		if (htmlElement) {
			return htmlElement.outerHTML.replace(`${htmlElement.innerHTML}</html>`, "");
		}
	});

	const themeColorElement = $.derived(() => {
		mode.current;

		if (!isBrowser) return;

		const themeColorElement = document.querySelector('meta[name="theme-color"]');

		if (themeColorElement) {
			return themeColorElement.outerHTML;
		}
	});

	var div = root_1();
	var p = $.child(div);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3);
	var node = $.sibling(p_3, 2);

	{
		var consequent = ($$anchor) => {
			var pre = root();
			var text_4 = $.only_child(pre, true);

			$.template_effect(() => $.set_text(text_4, $.get(htmlElement)));
			$.append($$anchor, pre);
		};

		$.if(node, ($$render) => {
			if ($.get(htmlElement) !== undefined) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var pre_1 = root();
			var text_5 = $.only_child(pre_1, true);

			$.template_effect(() => $.set_text(text_5, $.get(themeColorElement)));
			$.append($$anchor, pre_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(themeColorElement) !== undefined) $$render(consequent_1);
		});
	}

	var button = $.sibling(node_1, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `User prefers mode: ${userPrefersMode.current ?? ''}`);
		$.set_text(text_1, `System prefers mode: ${systemPrefersMode.current ?? ''}`);
		$.set_text(text_2, `Current mode: ${mode.current ?? ''}`);
		$.set_text(text_3, `Custom theme: ${(theme.current ? theme.current : "N/A") ?? ''}`);
	});

	$.delegated('click', button, function (...$$args) {
		toggleMode?.apply(this, $$args);
	});

	$.delegated('click', button_1, () => setMode("light"));
	$.delegated('click', button_2, () => setMode("dark"));
	$.delegated('click', button_3, () => setMode("system"));

	$.delegated('click', button_4, function (...$$args) {
		resetMode?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);