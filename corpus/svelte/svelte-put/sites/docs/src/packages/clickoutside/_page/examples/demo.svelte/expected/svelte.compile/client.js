import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickoutside } from '@svelte-put/clickoutside';
import { quintOut } from 'svelte/easing';
import { fly } from 'svelte/transition';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<strong class="inline-block"> </strong>`);
var root_1 = $.from_html(`<fieldset><legend class="text-error-fg font-bold">&nbsp; Limit &nbsp;</legend> <div class="border-suscess-fg hl-success grid border-2 p-6"><p><code>use:clickoutside</code> is registered for this <strong>green box</strong>. Try these:</p> <ol><li>Click within this <strong>green</strong> zone => <strong>won't</strong> trigger <code>onclickoutside</code></li> <li>Click on the <strong>red</strong> zone => <strong>will</strong> trigger <code>onclickoutside</code></li> <li>Click outside the <strong>red</strong> limit => <strong>won't</strong> trigger <code>onclickoutside</code></li> <li>Enable/disable <code>use:clickoutside</code> with button below, then try (2) again</li></ol></div> <div class="flex items-center justify-between"><p><code>onclickoutside</code> counter: <!></p> <button class="c-btn"><!></button></div></fieldset>`);

export default function Demo($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	let enabled = $.state(true);
	let parent = $.state(undefined);
	let click = $.state(0);

	function onClickOutside() {
		$.update(click);
	}

	function toggleEnabled(e) {
		e.stopPropagation();
		$.set(enabled, !$.get(enabled));
	}

	var fieldset = root_1();

	$.attribute_effect(fieldset, () => ({
		class: `border-error-fg hl-error select-none border-4 p-10 ${$$props.class ?? ''}`,
		...rest
	}));

	var div = $.sibling($.child(fieldset), 2);

	$.action(div, ($$node, $$action_arg) => clickoutside?.($$node, $$action_arg), () => ({ enabled: $.get(enabled), limit: { parent: $.get(parent) } }));

	var div_1 = $.sibling(div, 2);
	var p = $.child(div_1);
	var node = $.sibling($.child(p), 2);

	$.key(node, () => $.get(click), ($$anchor) => {
		var strong = root();
		var text = $.only_child(strong, true);

		$.template_effect(() => $.set_text(text, $.get(click)));
		$.transition(1, strong, () => fly, () => ({ y: 8, duration: 250, easing: quintOut }));
		$.append($$anchor, strong);
	});

	$.reset(p);

	var button = $.sibling(p, 2);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text('Disable');

			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var text_2 = $.text('Enable');

			$.append($$anchor, text_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(enabled)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_1);
	$.reset(fieldset);
	$.bind_this(fieldset, ($$value) => $.set(parent, $$value), () => $.get(parent));
	$.event('clickoutside', div, onClickOutside);
	$.delegated('click', button, toggleEnabled);
	$.append($$anchor, fieldset);
}

$.delegate(['click']);