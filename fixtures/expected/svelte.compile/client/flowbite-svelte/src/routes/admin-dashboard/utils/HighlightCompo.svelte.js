import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { HighlightSvelte, Highlight } from "svelte-rune-highlight";
import markdown from "highlight.js/lib/languages/markdown";
import { Clipboard } from "flowbite-svelte";
import { replaceLibImport } from "./helpers";
import { highlightcompo } from "./theme";

var root = $.from_html(`<button type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"> </button>`);
var root_1 = $.from_html(`<div><div tabindex="-1"><!> <!></div> <!></div>`);

export default function HighlightCompo($$anchor, $$props) {
	$.push($$props, true);

	// import clsx from "clsx";
	// componentStatus: boolean;
	let contentClass = $.prop($$props, 'contentClass', 3, "overflow-hidden"),
		replaceLib = $.prop($$props, 'replaceLib', 3, "runes-webkit");

	let value = $.derived(() => replaceLib()
		? replaceLibImport($$props.code, replaceLib())
		: $$props.code);

	let showExpandButton = $.state(false);
	let expand = $.state(false);

	const checkOverflow = (el) => {
		const isOverflowingY = el.clientHeight < el.scrollHeight;

		$.set(showExpandButton, isOverflowingY);
	};

	// const base = $derived(highlightcompo({ class: clsx(className) }));
	const base = $.derived(() => highlightcompo({ class: $$props.class }));

	const handleExpandClick = () => {
		$.set(expand, !$.get(expand));
	};

	const mdLang = { name: "markdown", register: markdown };
	var div = root_1();
	var div_1 = $.child(div);
	let classes;
	var node = $.child(div_1);

	{
		const children = ($$anchor, success = $.noop) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var text = $.text('Copied');

					$.append($$anchor, text);
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text('Copy');

					$.append($$anchor, text_1);
				};

				$.if(node_1, ($$render) => {
					if (success()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		Clipboard(node, {
			size: 'xs',
			color: 'alternative',
			class: 'absolute top-8 right-2 w-20 bg-gray-50 focus:ring-0 dark:bg-gray-800',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value);
			},
			children,
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Highlight($$anchor, {
				get language() {
					return mdLang;
				},

				get code() {
					return $.get(value);
				},
				class: 'm-0 p-0'
			});
		};

		var consequent_2 = ($$anchor) => {
			HighlightSvelte($$anchor, {
				get code() {
					return $.get(value);
				},
				class: 'm-0 p-0'
			});
		};

		var alternate_1 = ($$anchor) => {
			var text_2 = $.text('no code is provided');

			$.append($$anchor, text_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.codeLang === "md") $$render(consequent_1); else if ($.get(value)) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_1);
	$.action(div_1, ($$node) => checkOverflow?.($$node));

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var button = root();
			var text_3 = $.only_child(button, true);

			$.template_effect(() => $.set_text(text_3, $.get(expand) ? "Collapse code" : "Expand code"));
			$.delegated('click', button, handleExpandClick);
			$.append($$anchor, button);
		};

		$.if(node_3, ($$render) => {
			if ($.get(showExpandButton)) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx($.get(base)));
		classes = $.set_class(div_1, 1, `${contentClass() ?? ''} ${$.get(showExpandButton) ? 'pb-8' : ''}`, null, classes, { 'max-h-72': !$.get(expand) });
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);