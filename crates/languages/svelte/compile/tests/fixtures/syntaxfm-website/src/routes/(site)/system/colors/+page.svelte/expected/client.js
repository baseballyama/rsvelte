import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import toast from 'svelte-french-toast';
import ColorsInJs from './colors-in-js.svelte';
import { oklchToRgba, rgbaToHex } from '$/utilities/colors';

var root = $.from_html(`<div tabindex="0" role="button"> </div>`);
var root_1 = $.from_html(`<div class="wrapper svelte-19zn03o"><div tabindex="0" role="button" class="primary box svelte-19zn03o"> </div> <!></div>`);
var root_2 = $.from_html(`<label><select name="" id=""><option>HEX</option><option>Variable</option><option>OKLCH</option><option>RGBA</option></select></label> <section class="svelte-19zn03o"><!> <!></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const COLORS = ['black', 'yellow', 'teal', 'green', 'red', 'purple'];
	let type = $.state('HEX');

	function pick_color(index) {
		if (index >= 5) {
			return 1;
		} else if (index < 5) {
			return 8;
		}

		return Math.abs(index - 9);
	}

	function copy_color(color, currentTarget) {
		let local_color = color;

		if ($.get(type) === 'OKLCH') {
			local_color = getComputedStyle(document.documentElement).getPropertyValue(`--${color}`);
		} else if ($.get(type) === 'VARIABLE') {
			local_color = `var(--${color})`;
		} else if ($.get(type) === 'RGBA') {
			local_color = oklchToRgba(getComputedStyle(currentTarget).backgroundColor);
		} else if ($.get(type) === 'HEX') {
			let oklch = oklchToRgba(getComputedStyle(currentTarget).backgroundColor);

			local_color = rgbaToHex(oklch);
		}

		navigator.clipboard.writeText(local_color);
		toast.success(`Copied ${local_color} to clipboard`);
	}

	var fragment = root_2();
	var label = $.first_child(fragment);
	var select = $.child(label);
	var option = $.child(select);

	option.value = option.__value = 'HEX';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'VARIABLE';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'OKLCH';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'RGBA';
	$.reset(select);
	$.init_select(select);
	$.reset(label);

	var section = $.sibling(label, 2);
	var node = $.child(section);

	$.each(node, 17, () => COLORS, $.index, ($$anchor, color) => {
		var div = root_1();
		var div_1 = $.child(div);
		var text = $.only_child(div_1, true);
		var node_1 = $.sibling(div_1, 2);

		$.each(node_1, 16, () => Array(10), $.index, ($$anchor, item, index) => {
			var div_2 = root();

			$.set_class(div_2, 1, `box`, 'svelte-19zn03o');

			var text_1 = $.only_child(div_2);

			$.template_effect(
				($0) => {
					$.set_style(div_2, $0);
					$.set_text(text_1, `${$.get(color) ?? ''}-${index + 1}`);
				},
				[
					() => `--fg_demo_color: var(--${$.get(color)}-${pick_color(index)}); --fg_demo_box_color: var(--${$.get(color)}-${index + 1});`
				]
			);

			$.delegated('keydown', div_2, (e) => {
				let { currentTarget } = e;

				if (e.key === 'Enter' || e.keyCode === 13) {
					copy_color($.get(color), currentTarget);
				}
			});

			$.delegated('click', div_2, ({ currentTarget }) => copy_color(`${$.get(color)}-${index + 1}`, currentTarget));
			$.append($$anchor, div_2);
		});

		$.reset(div);

		$.template_effect(() => {
			$.set_style(div_1, `--fg_demo_box_color: var(--${$.get(color)})`);
			$.set_text(text, $.get(color));
		});

		$.delegated('keydown', div_1, (e) => {
			let { currentTarget } = e;

			if (e.key === 'Enter' || e.keyCode === 13) {
				copy_color($.get(color), currentTarget);
			}
		});

		$.delegated('click', div_1, ({ currentTarget }) => copy_color($.get(color), currentTarget));
		$.append($$anchor, div);
	});

	var node_2 = $.sibling(node, 2);

	ColorsInJs(node_2, {});
	$.reset(section);
	$.bind_select_value(select, () => $.get(type), ($$value) => $.set(type, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['keydown', 'click']);