import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Copy } from '.';
import { Badge, Icon, Code } from '@appwrite.io/pink-svelte';
import { IconCode, IconAndroid, IconFlutter, IconApple } from '@appwrite.io/pink-icons-svelte';

const langArr = ['js', 'html', 'dart', 'kotlin', 'json', 'sh', 'yml', 'swift'];

export function isLanguage(str) {
	return langArr.includes(str);
}

var root = $.from_html(`<button class="button is-small is-text is-only-icon" aria-label="copy code"><span class="icon-duplicate" aria-hidden="true"></span></button>`);
var root_1 = $.from_html(`<section><div class="controls u-position-absolute u-inset-inline-end-8 u-inset-block-start-8 u-flex u-gap-8"><!> <!></div> <!></section>`);

export default function Code_1($$anchor, $$props) {
	let label = $.prop($$props, 'label', 3, null),
		labelIcon = $.prop($$props, 'labelIcon', 3, null),
		withLineNumbers = $.prop($$props, 'withLineNumbers', 3, false),
		withCopy = $.prop($$props, 'withCopy', 3, false),
		noMargin = $.prop($$props, 'noMargin', 3, false),
		noBoxPadding = $.prop($$props, 'noBoxPadding', 3, false),
		allowScroll = $.prop($$props, 'allowScroll', 3, false),
		classes = $.prop($$props, 'class', 3, '');

	function getIcon(iconName) {
		switch (iconName) {
			case 'code':
				return IconCode;

			case 'android':
				return IconAndroid;

			case 'flutter':
				return IconFlutter;

			case 'apple':
				return IconApple;

			default:
				return null;
		}
	}

	var section = root_1();
	let classes_1;
	var div = $.child(section);
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			Badge($$anchor, {
				variant: 'secondary',
				get content() {
					return label();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => getIcon(labelIcon()));

								Icon($$anchor, {
									get icon() {
										return $.get($0);
									},
									size: 's',
									slot: 'start'
								});
							}
						};

						$.if(node_1, ($$render) => {
							if (labelIcon()) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			Copy($$anchor, {
				get value() {
					return $$props.code;
				},

				children: ($$anchor, $$slotProps) => {
					var button = root();

					$.append($$anchor, button);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if (withCopy()) $$render(consequent_2);
		});
	}

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Code(node_3, {
		get code() {
			return $$props.code;
		},

		get lang() {
			return $$props.language;
		},

		get lineNumbers() {
			return withLineNumbers();
		},
		hideHeader: true
	});

	$.reset(section);

	$.template_effect(() => classes_1 = $.set_class(section, 1, `box u-overflow-hidden ${classes() ?? ''}`, 'svelte-1gfff2r', classes_1, {
		'common-section': !noMargin(),
		noBoxPadding: noBoxPadding(),
		'with-scroll': allowScroll()
	}));

	$.append($$anchor, section);
}