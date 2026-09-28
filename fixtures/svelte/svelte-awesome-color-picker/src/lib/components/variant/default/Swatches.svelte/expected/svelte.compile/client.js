import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button" class="swatch svelte-33r1sg"></button>`);
var root_1 = $.from_html(`<div class="swatches svelte-33r1sg"></div>`);

export default function Swatches($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 20, () => $$props.swatches, (color) => color, ($$anchor, color) => {
				var button = root();

				$.template_effect(
					($0) => {
						$.set_style(button, `background: ${color ?? ''}`);
						$.set_attribute(button, 'aria-label', $0);
					},
					[() => $$props.texts.swatch.ariaLabel(color)]
				);

				$.delegated('click', button, () => $$props.selectSwatch(color));
				$.append($$anchor, button);
			});

			$.reset(div);
			$.template_effect(() => $.set_attribute(div, 'aria-label', $$props.texts.swatch.ariaTitle));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.swatches) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);