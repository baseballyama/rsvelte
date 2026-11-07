import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li role="option"><i></i> <span class="text"> </span></li>`);

export default function ComponentPickerMenuItem($$anchor, $$props) {
	$.push($$props, true);

	let option = $.prop($$props, 'option', 7);
	let className = $.derived(() => 'item' + ($$props.isSelected ? ' selected' : ''));
	var li = root();

	$.set_attribute(li, 'tabindex', -1);

	var i = $.child(li);
	var span = $.sibling(i, 2);
	var text = $.only_child(span, true);

	$.reset(li);
	$.bind_this(li, ($$value) => option().ref = $$value, () => option()?.ref);

	$.template_effect(() => {
		$.set_class(li, 1, $.clsx($.get(className)));
		$.set_attribute(li, 'aria-selected', $$props.isSelected);
		$.set_attribute(li, 'id', 'typeahead-item-' + $$props.index);
		$.set_class(i, 1, $.clsx(option().icon));
		$.set_text(text, option().title);
	});

	$.event('mouseenter', li, function (...$$args) {
		$$props.onmouseenter?.apply(this, $$args);
	});

	$.delegated('click', li, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, li);
	$.pop();
}

$.delegate(['click']);