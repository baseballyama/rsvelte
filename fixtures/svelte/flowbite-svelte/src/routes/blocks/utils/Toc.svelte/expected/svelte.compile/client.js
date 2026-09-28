import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from "$app/navigation";
import { tick } from "svelte";

var root = $.from_html(`<li><a> </a></li>`);
var root_1 = $.from_html(`<div class="sticky top-20 flex h-[calc(100vh-5rem)] flex-col justify-between overflow-y-auto pb-6"><div class="mb-40"><h4 class="my-4 ps-2.5 text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-white">On this page</h4> <nav><ul class="space-y-2.5 overflow-x-hidden font-medium text-gray-500 dark:text-gray-400"></ul></nav></div></div>`);
var root_2 = $.from_html(`<div class="me-auto hidden w-64 flex-none ps-8 xl:block xl:text-sm"><!></div>`);

export default function Toc($$anchor, $$props) {
	$.push($$props, true);

	/*
	  Inspired by 'svelte-toc'
	  Simplified version of Table of Contents.
	  */
	const aClass = "inline-block border-s border-white duration-200 hover:text-gray-900 transition-none dark:hover:text-white hover:border-gray-300 after:content-['#'] after:text-primary-700 dark:after:text-primary-700 dark:border-gray-900 dark:hover:border-gray-700 after:ms-2 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-100";

	let extract = $.prop($$props, 'extract', 3, (x) => ({ name: x.textContent ?? "" }));
	let headings = $.state($.proxy([]));

	function indent(name) {
		return name === "H2" ? "ps-2.5" : "ps-6";
	}

	function toc(_) {
		// Delay initalization to post page load
		tick().then(() => {
			if (typeof document === `undefined`) return; // for SSR

			$.set(headings, [...document.querySelectorAll($$props.headingSelector)].map(extract()).filter((x) => x.name), true);
		});
	}

	afterNavigate(toc);

	var div = root_2();

	$.action($.document, ($$node) => toc?.($$node));

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var nav = $.sibling($.child(div_2), 2);
			var ul = $.child(nav);

			$.each(ul, 21, () => $.get(headings), $.index, ($$anchor, $$item) => {
				let rel = () => $.get($$item).rel;
				let href = () => $.get($$item).href;
				let name = () => $.get($$item).name;
				var li = root();
				var a = $.child(li);
				var text = $.only_child(a, true);

				$.reset(li);

				$.template_effect(
					($0) => {
						$.set_attribute(a, 'href', href());
						$.set_class(a, 1, `${$0 ?? ''} inline-block border-s border-white duration-200 hover:text-gray-900 transition-none dark:hover:text-white hover:border-gray-300 after:content-['#'] after:text-primary-700 dark:after:text-primary-700 dark:border-gray-900 dark:hover:border-gray-700 after:ms-2 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-100`);
						$.set_text(text, name());
					},
					[() => indent(rel())]
				);

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(nav);
			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(headings).length) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}