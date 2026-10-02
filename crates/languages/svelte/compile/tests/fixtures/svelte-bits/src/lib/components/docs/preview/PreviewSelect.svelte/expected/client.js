import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button" role="option"> </button>`);
var root_1 = $.from_html(`<div class="scrubber-dropdown" role="listbox"></div>`);
var root_2 = $.from_html(`<div class="scrubber"><button type="button" class="scrubber-track scrubber-track--select" aria-haspopup="listbox"><div class="scrubber-label"> </div> <div class="scrubber-select-right"><span class="scrubber-value"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></div></button> <!></div>`);

export default function PreviewSelect($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, ''),
		value = $.prop($$props, 'value', 3, ''),
		options = $.prop($$props, 'options', 19, () => []),
		isDisabled = $.prop($$props, 'isDisabled', 3, false);

	let open = $.state(false);
	let rootEl = $.state(null);
	const normalized = $.derived(() => options().map((o) => typeof o === 'string' ? { label: o, value: o } : o));
	const current = $.derived(() => $.get(normalized).find((o) => o.value === value()));

	$.user_effect(() => {
		if (!$.get(open)) return;

		const handler = (e) => {
			if ($.get(rootEl) && !$.get(rootEl).contains(e.target)) $.set(open, false);
		};

		document.addEventListener('mousedown', handler);

		return () => document.removeEventListener('mousedown', handler);
	});

	function pick(v) {
		$$props.onChange?.(v);
		$.set(open, false);
	}

	var div = root_2();
	var button = $.child(div);
	var div_1 = $.child(button);
	var text = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var span = $.child(div_2);
	var text_1 = $.only_child(span, true);
	var svg = $.sibling(span, 2);

	$.reset(div_2);
	$.reset(button);

	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_1();

			$.each(div_3, 21, () => $.get(normalized), (opt) => opt.value, ($$anchor, opt) => {
				var button_1 = root();
				var text_2 = $.only_child(button_1, true);

				$.template_effect(() => {
					$.set_class(button_1, 1, `scrubber-dropdown-item ${$.get(opt).value === value() ? 'scrubber-dropdown-item--active' : ''}`);
					$.set_attribute(button_1, 'aria-selected', $.get(opt).value === value());
					$.set_text(text_2, $.get(opt).label);
				});

				$.delegated('click', button_1, () => pick($.get(opt).value));
				$.append($$anchor, button_1);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(rootEl, $$value), () => $.get(rootEl));

	$.template_effect(() => {
		$.set_attribute(button, 'aria-expanded', $.get(open));
		$.set_attribute(button, 'aria-label', title());
		$.set_attribute(button, 'aria-disabled', isDisabled());
		$.set_attribute(button, 'data-disabled', isDisabled());
		$.set_attribute(button, 'data-active', $.get(open));
		$.set_text(text, title());
		$.set_text(text_1, $.get(current)?.label ?? value());
		$.set_class(svg, 0, `scrubber-caret ${$.get(open) ? 'scrubber-caret--open' : ''}`);
	});

	$.delegated('click', button, () => !isDisabled() && $.set(open, !$.get(open)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);