import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickoutside } from '@svelte-put/clickoutside';
import { COLOR_SCHEMES } from '$lib/constants';
import { SettingsContext } from '$lib/settings/context.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<li class="border-b last:border-b-0"><form method="GET"><label><input type="submit" name="color-scheme" class="sr-only"/> <!> <span class="text-sm"> </span></label></form></li>`);
var root_2 = $.from_html(`<div><label class="c-btn c-btn--icon grid grid-cols-[auto_auto] gap-2 svelte-ewd8h4" id="csm-toggler"><span class="sr-only"> </span> <!> <input type="checkbox" class="sr-only svelte-ewd8h4"/> <i></i></label> <div class="csm-dropdown svelte-ewd8h4"><div class="overflow-hidden"><ul class="bg-bg relative border"></ul></div></div></div>`);

export default function ColorSchemeMenu($$anchor, $$props) {
	$.push($$props, true);

	const icon = ($$anchor, scheme = $.noop) => {
		var span = root();

		$.template_effect(() => $.set_class(span, 1, `i ${iconClassMap[scheme()] ?? ''} h-6 w-6 shrink-0`, 'svelte-ewd8h4'));
		$.append($$anchor, span);
	};

	let rest = $.rest_props($$props, rest_excludes);
	let open = $.state(false);
	let settings = SettingsContext.get();

	function toggle(force) {
		$.set(open, force ?? !$.get(open), true);
	}

	const LABELS = { light: 'Light', dark: 'Dark', system: 'System' };

	const iconClassMap = {
		light: 'i-[sun]',
		dark: 'i-[moon-stars]',
		system: 'i-[desktop]'
	};

	var div = root_2();

	$.attribute_effect(
		div,
		() => ({
			class: `color-scheme-menu csm relative ${$$props.class ?? ''}`,
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-ewd8h4'
	);

	var label = $.child(div);
	var span_1 = $.child(label);
	var text = $.only_child(span_1, true);
	var node = $.sibling(span_1, 2);

	icon(node, () => settings.colorScheme);

	var input = $.sibling(node, 2);

	$.remove_input_defaults(input);

	var i = $.sibling(input, 2);
	let classes;

	$.reset(label);

	var div_1 = $.sibling(label, 2);
	var div_2 = $.child(div_1);
	var ul = $.child(div_2);

	$.each(ul, 21, () => COLOR_SCHEMES, $.index, ($$anchor, scheme) => {
		var li = root_1();
		var form = $.child(li);
		var label_1 = $.child(form);
		let classes_1;
		var input_1 = $.child(label_1);

		$.remove_input_defaults(input_1);

		var node_1 = $.sibling(input_1, 2);

		icon(node_1, () => $.get(scheme));

		var span_2 = $.sibling(node_1, 2);
		var text_1 = $.only_child(span_2, true);

		$.reset(label_1);
		$.reset(form);
		$.reset(li);

		$.template_effect(() => {
			classes_1 = $.set_class(label_1, 1, 'c-btn c-btn--outlined focus-within:bg-bg-200 justify-start gap-4 border-none px-4\n								py-2 focus-within:outline-none', null, classes_1, { 'text-primary': $.get(scheme) === settings.colorScheme });
			$.set_value(input_1, $.get(scheme));
			$.set_text(text_1, LABELS[$.get(scheme)]);
		});

		$.event('submit', form, (e) => {
			e.preventDefault();
			settings.colorScheme = $.get(scheme);
			toggle(false);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_2);
	$.reset(div_1);
	$.action(div_1, ($$node, $$action_arg) => clickoutside?.($$node, $$action_arg), () => ({ enabled: $.get(open) }));
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, settings.colorScheme);
		classes = $.set_class(i, 1, 'i i-[caret-down] h-5 w-5 transition-transform', null, classes, { 'rotate-180': $.get(open) });
		div_1.inert = !$.get(open);
	});

	$.delegated('click', label, (e) => e.stopPropagation());
	$.bind_checked(input, () => $.get(open), ($$value) => $.set(open, $$value));
	$.event('clickoutside', div_1, () => toggle(false));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);