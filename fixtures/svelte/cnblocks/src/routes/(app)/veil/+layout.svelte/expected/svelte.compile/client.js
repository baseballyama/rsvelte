import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scrollY } from "svelte/reactivity/window";
import Button from "$lib/components/ui/button/button.svelte";
import VeilCategoryNav from "$lib/web/layouts/VeilCategoryNav.svelte";
import { fly } from "svelte/transition";

const scrollToTop = ($$anchor) => {
	var div = root_1();
	var node = $.child(div);

	Button(node, {
		size: 'icon',
		variant: 'secondary',
		class: 'rounded-full',
		onclick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
		children: ($$anchor, $$slotProps) => {
			var svg = root();

			$.append($$anchor, svg);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.transition(1, div, () => fly, () => ({ y: 20 }));
	$.transition(2, div, () => fly, () => ({ y: 20 }));
	$.append($$anchor, div);
};

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`);
var root_1 = $.from_html(`<div class="fixed right-4 bottom-4 z-50"><!></div>`);
var root_2 = $.from_html(`<div><!> <section><div class="h-6 w-full bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] opacity-35"></div></section> <!> <!></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let visible = $.derived(() => typeof scrollY.current === "undefined" ? 600 : scrollY.current > 1200);
	var div_1 = root_2();
	var node_1 = $.child(div_1);

	VeilCategoryNav(node_1, {});

	var node_2 = $.sibling(node_1, 4);

	$.snippet(node_2, () => $$props.children);

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			scrollToTop($$anchor);
		};

		$.if(node_3, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.append($$anchor, div_1);
	$.pop();
}