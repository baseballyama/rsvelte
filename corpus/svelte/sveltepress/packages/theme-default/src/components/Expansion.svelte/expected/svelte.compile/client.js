import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import slide from './actions/slide';
import ArrowDown from './icons/ArrowDown.svelte';
import Markdown from './icons/Markdown.svelte';
import Svelte from './icons/Svelte.svelte';
import SvelteWithColor from './icons/SvelteWithColor.svelte';

const arrow = ($$anchor) => {
	ArrowDown($$anchor, {});
};

var root = $.from_html(`<div class="c-expansion--body"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center text-6 text-svp-primary"><!></div>`);
var root_2 = $.from_html(`<div class="flex items-center text-6"><!></div>`);
var root_3 = $.from_html(`<div class="c-expansion--icon svelte-1q97gs7"><!></div>`);
var root_4 = $.from_html(`<div><!> <div class="c-expansion--header svelte-1q97gs7" role="button" tabindex="0"><div class="c-expansion--header-left svelte-1q97gs7"><!> <div class="c-expansion--title svelte-1q97gs7"><!></div></div> <div><!></div></div> <!></div>`);

export default function Expansion($$anchor, $$props) {
	const /**
	 * @typedef {object} Props
	 * @property {string} title The title of the expansion
	 * @property {boolean} expanded Determine whether the expansion is expanded or not. It is recomended to use `bind:expanded`
	 * @property {boolean} reverse Determine the expand direction, `false` means down, `true` means up
	 * @property {string} headerStyle Custom header style
	 * @property {import('svelte').Snippet} iconFold custom fold icon
	 * @property {import('svelte').Snippet} iconExpanded custom expand icon
	 * @property {import('svelte').Snippet} customTitle custom title content
	 * @property {'svelte' | 'md'} codeType The code type of the icon, `svelte` or `md`
	 */
	/** @type {Props} */
	/**
	 *
	 * @type {string}
	 */
	/**
	 * The panel body dom
	 * @type {HTMLDivElement}
	 */
	body = ($$anchor) => {
		var div = root();
		var node = $.child(div);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.reset(div);
		$.action(div, ($$node, $$action_arg) => slide?.($$node, $$action_arg), expanded);
		$.bind_this(div, ($$value) => bodyDom($$value), () => bodyDom());
		$.append($$anchor, div);
	};

	const defaultIconExpanded = ($$anchor) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				SvelteWithColor($$anchor, {});
			};

			var consequent_1 = ($$anchor) => {
				var div_1 = root_1();
				var node_2 = $.child(div_1);

				Markdown(node_2, {});
				$.reset(div_1);
				$.append($$anchor, div_1);
			};

			$.if(node_1, ($$render) => {
				if (codeType() === 'svelte') $$render(consequent); else if (codeType() === 'md') $$render(consequent_1, 1);
			});
		}

		$.append($$anchor, fragment);
	};

	const defaultIconFold = ($$anchor) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		{
			var consequent_2 = ($$anchor) => {
				Svelte($$anchor, {});
			};

			var consequent_3 = ($$anchor) => {
				var div_2 = root_2();
				var node_4 = $.child(div_2);

				Markdown(node_4, {});
				$.reset(div_2);
				$.append($$anchor, div_2);
			};

			$.if(node_3, ($$render) => {
				if (codeType() === 'svelte') $$render(consequent_2); else if (codeType() === 'md') $$render(consequent_3, 1);
			});
		}

		$.append($$anchor, fragment_2);
	};

	const defaultCustomTitle = ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $$props.title));
		$.append($$anchor, text);
	};

	let expanded = $.prop($$props, 'expanded', 7, false),
		reverse = $.prop($$props, 'reverse', 3, false),
		headerStyle = $.prop($$props, 'headerStyle', 3, ''),
		codeType = $.prop($$props, 'codeType', 3, 'svelte'),
		showIcon = $.prop($$props, 'showIcon', 3, true),
		bodyDom = $.prop($$props, 'bodyDom', 7);

	function onHeaderClick(e) {
		e.stopPropagation();
		expanded(!expanded());
	}

	var div_3 = root_4();
	var node_5 = $.child(div_3);

	{
		var consequent_4 = ($$anchor) => {
			body($$anchor);
		};

		$.if(node_5, ($$render) => {
			if (reverse()) $$render(consequent_4);
		});
	}

	var div_4 = $.sibling(node_5, 2);
	var div_5 = $.child(div_4);
	var node_6 = $.child(div_5);

	{
		var consequent_8 = ($$anchor) => {
			var div_6 = root_3();
			var node_7 = $.child(div_6);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_8 = $.first_child(fragment_7);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_9 = $.first_child(fragment_8);

							$.snippet(node_9, () => $$props.iconExpanded);
							$.append($$anchor, fragment_8);
						};

						var alternate = ($$anchor) => {
							defaultIconExpanded($$anchor);
						};

						$.if(node_8, ($$render) => {
							if ($$props.iconExpanded) $$render(consequent_5); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_7);
				};

				var consequent_7 = ($$anchor) => {
					var fragment_10 = $.comment();
					var node_10 = $.first_child(fragment_10);

					$.snippet(node_10, () => $$props.iconFold);
					$.append($$anchor, fragment_10);
				};

				var alternate_1 = ($$anchor) => {
					defaultIconFold($$anchor);
				};

				$.if(node_7, ($$render) => {
					if (expanded()) $$render(consequent_6); else if ($$props.iconFold) $$render(consequent_7, 1); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_6, ($$render) => {
			if (showIcon()) $$render(consequent_8);
		});
	}

	var div_7 = $.sibling(node_6, 2);
	var node_11 = $.child(div_7);

	{
		var consequent_9 = ($$anchor) => {
			var fragment_12 = $.comment();
			var node_12 = $.first_child(fragment_12);

			$.snippet(node_12, () => $$props.customTitle);
			$.append($$anchor, fragment_12);
		};

		var alternate_2 = ($$anchor) => {
			defaultCustomTitle($$anchor);
		};

		$.if(node_11, ($$render) => {
			if ($$props.customTitle) $$render(consequent_9); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_7);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var node_13 = $.child(div_8);

	arrow(node_13);
	$.reset(div_8);
	$.reset(div_4);

	var node_14 = $.sibling(div_4, 2);

	{
		var consequent_10 = ($$anchor) => {
			body($$anchor);
		};

		$.if(node_14, ($$render) => {
			if (!reverse()) $$render(consequent_10);
		});
	}

	$.reset(div_3);

	$.template_effect(() => {
		$.set_class(div_3, 1, `c-expansion ${expanded() ? 'c-expansion--expanded' : ''}`, 'svelte-1q97gs7');
		$.set_style(div_4, headerStyle());
		$.set_class(div_8, 1, `c-expansion--arrow ${expanded() ? 'c-expansion--arrow-expanded' : ''}`, 'svelte-1q97gs7');
	});

	$.delegated('click', div_4, onHeaderClick);
	$.event('keypress', div_4, () => {});
	$.append($$anchor, div_3);
}

$.delegate(['click']);