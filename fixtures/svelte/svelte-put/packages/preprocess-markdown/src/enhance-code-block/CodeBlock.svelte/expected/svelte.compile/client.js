import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '@svelte-put/copy';
import ButtonCollapse from './ButtonCollapse.svelte';
import ButtonCopy, { copyCode } from './ButtonCopy.svelte';
import ButtonFullScreen from './ButtonFullScreen.svelte';
import { CodeBlockGroupContext } from './CodeBlockGroup.svelte';
import FileIcon from './FileIcon.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'lang',
	'title',
	'hideLineNumber',
	'numLines',
	'collapsed',
	'children',
	'class'
]);

var root = $.from_html(`<span class="codeblock-title svelte-152p7v7"><!> <span class="svelte-152p7v7"> </span></span>`);
var root_1 = $.from_html(`<span class="svelte-152p7v7"> </span>`);
var root_2 = $.from_html(`<label class="codeblock-group-label svelte-152p7v7"><!> <input type="radio" class="codeblock-group-selected sr-only svelte-152p7v7"/></label>`);
var root_3 = $.from_html(`<label class="codeblock-header svelte-152p7v7"><!></label>`);
var root_4 = $.from_html(`<section><!> <div class="codeblock-content svelte-152p7v7"><div class="codeblock-content-accordion svelte-152p7v7"><div class="codeblock-btns svelte-152p7v7"><!> <!> <!></div> <div class="codeblock-pre-container svelte-152p7v7"><!></div></div></div></section>`);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	const // init context & id
	// resolve the collapsed prop
	titleAndFileIcon = ($$anchor) => {
		var span = root();
		var node = $.child(span);

		FileIcon(node, {
			get lang() {
				return lang();
			}
		});

		var span_1 = $.sibling(node, 2);
		var text = $.only_child(span_1, true);

		$.reset(span);
		$.template_effect(() => $.set_text(text, title()));
		$.append($$anchor, span);
	};

	const lang = $.prop($$props, 'lang', 3, ''),
		title = $.prop($$props, 'title', 3, ''),
		hideLineNumber = $.prop($$props, 'hideLineNumber', 3, 'false'),
		numLines = $.prop($$props, 'numLines', 3, undefined),
		collapsed = $.prop($$props, 'collapsed', 3, 'false'),
		rest = $.rest_props($$props, rest_excludes);

	const groupContext = CodeBlockGroupContext.get();
	const id = Math.random().toString(36).slice(2);

	const fullScreenCheckBoxId = groupContext
		? `codeblock-group-${groupContext.id}-fullscreen`
		: `codeblock-${id}-fullscreen`;

	const collapsedCheckboxId = `codeblock-${id}-collapsed`;
	let collapsible = $.derived(() => groupContext ? false : collapsed() !== 'disabled');
	let collapsedInputChecked = $.state(collapsed() === 'true');

	$.user_effect(() => {
		if (!$.get(collapsible)) $.set(collapsedInputChecked, false);
	});

	let copyBtnEl = $.state(undefined);
	let codeBlockEl = $.state(undefined);
	var section = root_4();

	$.attribute_effect(
		section,
		() => ({
			class: `codeblock ${$$props.class ?? ''}`,
			...groupContext && { 'data-group-display': groupContext.display },
			...rest,
			[$.CLASS]: {
				collapsible: groupContext ? false : $.get(collapsible),
				titled: !!title(),
				grouped: !!groupContext,
				'hide-line-number': hideLineNumber() !== 'false'
			},
			[$.STYLE]: {
				'--num-line-width': `${numLines() ? numLines().length + 2 : 4}ch`
			}
		}),
		void 0,
		void 0,
		void 0,
		'svelte-152p7v7'
	);

	var node_1 = $.child(section);

	{
		var consequent_1 = ($$anchor) => {
			var label = root_2();
			var node_2 = $.child(label);

			{
				var consequent = ($$anchor) => {
					titleAndFileIcon($$anchor);
				};

				var alternate = ($$anchor) => {
					var span_2 = root_1();
					var text_1 = $.only_child(span_2, true);

					$.template_effect(() => $.set_text(text_1, title()));
					$.append($$anchor, span_2);
				};

				$.if(node_2, ($$render) => {
					if (groupContext.display === 'files') $$render(consequent); else $$render(alternate, -1);
				});
			}

			var input = $.sibling(node_2, 2);

			$.remove_input_defaults(input);

			var input_value;

			$.reset(label);

			$.template_effect(() => {
				$.set_attribute(input, 'name', groupContext.name);
				$.set_checked(input, title() === groupContext.title);

				if (input_value !== (input_value = title())) {
					input.value = (input.__value = input_value) ?? '';
				}
			});

			$.bind_group(
				binding_group,
				[],
				input,
				() => {
					title();

					return groupContext.title;
				},
				($$value) => groupContext.title = $$value
			);

			$.append($$anchor, label);
		};

		var alternate_1 = ($$anchor) => {
			var label_1 = root_3();
			var node_3 = $.child(label_1);

			titleAndFileIcon(node_3);
			$.reset(label_1);
			$.template_effect(() => $.set_attribute(label_1, 'for', collapsedCheckboxId));
			$.append($$anchor, label_1);
		};

		$.if(node_1, ($$render) => {
			if (groupContext) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	var div = $.sibling(node_1, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_4 = $.child(div_2);

	ButtonCopy(node_4, {
		class: 'codeblock-btn',
		get trigger() {
			return $.get(copyBtnEl);
		},

		set trigger($$value) {
			$.set(copyBtnEl, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	ButtonFullScreen(node_5, {
		class: 'codeblock-btn codeblock--btn--collapse',
		get codeblock() {
			return $.get(codeBlockEl);
		},

		get id() {
			return fullScreenCheckBoxId;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_2 = ($$anchor) => {
			ButtonCollapse($$anchor, {
				class: 'codeblock-btn codeblock-btn--collapse',
				get id() {
					return collapsedCheckboxId;
				},

				get collapsed() {
					return $.get(collapsedInputChecked);
				}
			});
		};

		$.if(node_6, ($$render) => {
			if ($.get(collapsible)) $$render(consequent_2);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_7 = $.child(div_3);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_8 = $.first_child(fragment_2);

			$.snippet(node_8, () => $$props.children);
			$.append($$anchor, fragment_2);
		};

		$.if(node_7, ($$render) => {
			if ($$props.children) $$render(consequent_3);
		});
	}

	$.reset(div_3);
	$.action(div_3, ($$node, $$action_arg) => copy?.($$node, $$action_arg), () => ({ trigger: $.get(copyBtnEl), text: copyCode }));
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.bind_this(section, ($$value) => $.set(codeBlockEl, $$value), () => $.get(codeBlockEl));
	$.append($$anchor, section);
	$.pop();
}