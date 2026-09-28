import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><span>Click me</span></button>`);
var root_1 = $.from_html(`<tr class="*:border *:p-4"><th class="text-left capitalize" scope="row"> </th><td><button><i class="i i-[info] h-6 w-6"></i> <span>Click me</span></button></td><td><!></td><td><button data-delayed=""><i class="i i-[info] h-6 w-6"></i> <span>Click me</span></button></td><td><button data-timeout=""><i class="i i-[info] h-6 w-6"></i> <span>Click me</span></button></td><td><button disabled=""><i class="i i-[info] h-6 w-6"></i> <span>Click me</span></button></td></tr>`);
var root_2 = $.from_html(`<main class="mx-auto max-w-5xl p-10"><table class="border-collapse"><thead><tr class="*:bg-bg-100 *:border *:p-4"><th scope="col">Variant</th><th scope="col">Default</th><th scope="col">No Icon</th><th scope="col">Delayed</th><th scope="col">Timeout</th><th scope="col">Disabled</th></tr></thead><tbody></tbody></table></main>`);

export default function _page($$anchor) {
	const variant_to_css = {
		default: 'c-btn',
		outlied: 'c-btn c-btn--outlined',
		pop: 'c-btn c-btn--pop',
		icon: 'c-btn c-btn--icon'
	};

	var main = root_2();
	var table = $.child(main);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => Object.entries(variant_to_css), $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let variant = () => $.get($$array)[0];
		let css = () => $.get($$array)[1];
		var tr = root_1();
		var th = $.child(tr);
		var text = $.only_child(th, true);
		var td = $.sibling(th);
		var button = $.child(td);
		var span = $.sibling($.child(button), 2);
		let classes;

		$.reset(button);
		$.reset(td);

		var td_1 = $.sibling(td);
		var node = $.child(td_1);

		{
			var consequent = ($$anchor) => {
				var button_1 = root();

				$.template_effect(() => $.set_class(button_1, 1, $.clsx(css())));
				$.append($$anchor, button_1);
			};

			$.if(node, ($$render) => {
				if (variant() !== 'icon') $$render(consequent);
			});
		}

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var button_2 = $.child(td_2);
		var span_1 = $.sibling($.child(button_2), 2);
		let classes_1;

		$.reset(button_2);
		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var button_3 = $.child(td_3);
		var span_2 = $.sibling($.child(button_3), 2);
		let classes_2;

		$.reset(button_3);
		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var button_4 = $.child(td_4);
		var span_3 = $.sibling($.child(button_4), 2);
		let classes_3;

		$.reset(button_4);
		$.reset(td_4);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text, variant());
			$.set_class(button, 1, $.clsx(css()));
			classes = $.set_class(span, 1, '', null, classes, { 'sr-only': variant() === 'icon' });
			$.set_class(button_2, 1, $.clsx(css()));
			classes_1 = $.set_class(span_1, 1, '', null, classes_1, { 'sr-only': variant() === 'icon' });
			$.set_class(button_3, 1, $.clsx(css()));
			classes_2 = $.set_class(span_2, 1, '', null, classes_2, { 'sr-only': variant() === 'icon' });
			$.set_class(button_4, 1, $.clsx(css()));
			classes_3 = $.set_class(span_3, 1, '', null, classes_3, { 'sr-only': variant() === 'icon' });
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(main);
	$.append($$anchor, main);
}