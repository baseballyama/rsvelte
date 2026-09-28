import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { HighlightSvelte, Highlight } from "svelte-rune-highlight";
import markdown from "highlight.js/lib/languages/markdown";
import { Button, Badge } from "flowbite-svelte";
import { copyToClipboard, replaceLibImport } from "./helpers";
import { highlightcompo } from "./theme";

var root = $.from_html(`<button type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"> </button>`);
var root_1 = $.from_html(`<div><div class="relative"><div tabindex="-1"><!> <!></div> <!> <!></div></div>`);

export default function HighlightCompo($$anchor, $$props) {
	$.push($$props, true);

	// componentStatus: boolean;
	let replaceLib = $.prop($$props, 'replaceLib', 3, true);

	let processedCode = $.derived(() => replaceLib() ? replaceLibImport($$props.code) : $$props.code);
	let showExpandButton = $.state(false);
	let expand = $.state(false);

	const checkOverflow = (el) => {
		const isOverflowingY = el.clientHeight < el.scrollHeight;

		$.set(showExpandButton, isOverflowingY);
	};

	const $$d = $.derived(highlightcompo),
		base = $.derived(() => $.get($$d).base),
		badge = $.derived(() => $.get($$d).badge),
		button = $.derived(() => $.get($$d).button);

	let copiedStatus = $.state(false);

	const handleExpandClick = () => {
		$.set(expand, !$.get(expand));
	};

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
	var div = root_1();
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
			HighlightSvelte($$anchor, {
				get code() {
					return $.get(processedCode);
				}
			});
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text('no code is provided');

			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.codeLang === "md") $$render(consequent_1); else if ($.get(processedCode)) $$render(consequent_2, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);
	$.action(div_2, ($$node) => checkOverflow?.($$node));

	var node_2 = $.sibling(div_2, 2);

	{
		let $0 = $.derived(() => $.get(button)({ class: $$props.buttonClass }));

		Button(node_2, {
			get class() {
				return $.get($0);
			},
			onclick: handleCopyClick,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Copy');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var button_1 = root();
			var text_3 = $.only_child(button_1, true);

			$.template_effect(() => $.set_text(text_3, $.get(expand) ? "Collapse code" : "Expand code"));
			$.delegated('click', button_1, handleExpandClick);
			$.append($$anchor, button_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(showExpandButton)) $$render(consequent_3);
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			classes = $.set_class(div_2, 1, `overflow-x-auto p-6 ${$.get(showExpandButton) ? 'pb-16' : ''}`, null, classes, { 'max-h-72': !$.get(expand) });
		},
		[() => $.clsx($.get(base)({ className: $$props.class }))]
	);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);