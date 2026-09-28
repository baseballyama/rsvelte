import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Highlight } from "svelte-rune-highlight";
import markdown from "highlight.js/lib/languages/markdown";
import { Button, Badge } from "$lib";
import { copyToClipboard, replaceLibImport } from "./helpers";
import { highlightcompo } from "./theme";

var root = $.from_html(`<div class="highlight"><pre class="language-svelte !-mt-2 mb-0 !rounded-none"> </pre></div>`);
var root_1 = $.from_svg(`<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path></svg>`);
var root_2 = $.from_html(`<button type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"> </button>`);
var root_3 = $.from_html(`<div><div class="relative"><div tabindex="-1"><!> <!></div> <!> <!></div></div>`);

export default function DynamicCodeBlockHighlight($$anchor, $$props) {
	$.push($$props, true);

	// componentStatus: boolean;
	let processedCode = $.derived(() => $$props.replaceLib ? replaceLibImport($$props.code) : $$props.code);

	const $$d = $.derived(highlightcompo),
		base = $.derived(() => $.get($$d).base),
		badge = $.derived(() => $.get($$d).badge),
		button = $.derived(() => $.get($$d).button);

	let copiedStatus = $.state(false);

	function handleCopyClick() {
		copyToClipboard($.get(processedCode)).then(() => {
			$.set(copiedStatus, true);

			setTimeout(
				() => {
					$.set(copiedStatus, false);
				},
				1000
			);
		}).catch((err) => {
			console.error("Error in copying:", err);

			// Handle the error as needed
		});
	}

	const mdLang = { name: "markdown", register: markdown };
	var div = root_3();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	let classes;
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(badge)({ class: $$props.badgeClass }));

				Badge($$anchor, {
					get class() {
						return $.get($0);
					},
					color: 'green',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Copied to clipboard');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(copiedStatus)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Highlight($$anchor, {
				get language() {
					return mdLang;
				},

				get code() {
					return $.get(processedCode);
				}
			});
		};

		var consequent_2 = ($$anchor) => {
			var div_3 = root();
			var pre = $.child(div_3);
			var text_1 = $.only_child(pre, true);

			$.reset(div_3);
			$.template_effect(() => $.set_text(text_1, $.get(processedCode)));
			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var text_2 = $.text('no code is provided');

			$.append($$anchor, text_2);
		};

		$.if(node_1, ($$render) => {
			if ($$props.codeLang === "md") $$render(consequent_1); else if ($.get(processedCode)) $$render(consequent_2, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	{
		let $0 = $.derived(() => $.get(button)({ class: $$props.buttonClass }));

		Button(node_2, {
			get class() {
				return $.get($0);
			},
			onclick: handleCopyClick,
			children: ($$anchor, $$slotProps) => {
				var svg = root_1();

				$.append($$anchor, svg);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var button_1 = root_2();
			var text_3 = $.only_child(button_1, true);

			$.template_effect(() => $.set_text(text_3, $$props.expand ? "Collapse code" : "Expand code"));
			$.delegated('click', button_1, () => $$props.handleExpandClick());
			$.append($$anchor, button_1);
		};

		$.if(node_3, ($$render) => {
			if ($$props.showExpandButton) $$render(consequent_3);
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			classes = $.set_class(div_2, 1, `overflow-hidden ${$$props.showExpandButton ? 'pb-8' : ''}`, null, classes, { 'max-h-56': !$$props.expand });
		},
		[() => $.clsx($.get(base)({ className: $$props.class }))]
	);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);