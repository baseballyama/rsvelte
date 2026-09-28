import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { defaultA11yTexts } from '$lib/utils/texts.js';
import { extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { getNumberOfGradeFailed } from './grades.js';
import { getContrast } from '$lib/utils/colors.js';

var root = $.from_html(`<span class="guidelines svelte-1j34xld"></span>`);
var root_1 = $.from_html(`<div class="a11y-notice svelte-1j34xld"><span class="title svelte-1j34xld"> </span> <!> <!></div>`);

export default function A11yNotice($$anchor, $$props) {
	$.push($$props, true);

	/** customize the ColorPicker component parts. Can be used to display a Chrome variant or an Accessibility Notice */
	/** hex color */
	/** define the accessibility examples in the color picker */
	/** required WCAG contrast level */
	/** all a11y translation tokens used in the library; override with translations if necessary; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
	let a11yTexts = $.prop($$props, 'a11yTexts', 3, undefined);

	extend([a11yPlugin]);

	function getTexts() {
		return { ...defaultA11yTexts, ...a11yTexts() };
	}

	let _a11yColors = $.derived(() => $$props.a11yColors.map((a11yColor) => getContrast(a11yColor, $$props.hex)).filter(Boolean).map((x) => x));
	let count = $.derived(() => $.get(_a11yColors).map((color) => getNumberOfGradeFailed(color, $$props.a11yLevel)).reduce((acc, c) => acc + c));
	var div = root_1();
	let styles;
	var span = $.child(div);
	var text = $.only_child(span, true);
	var node = $.sibling(span, 2);

	$.each(node, 17, () => $.get(_a11yColors), $.index, ($$anchor, $$item) => {
		let trueColors = () => $.get($$item).trueColors;
		let contrast = () => $.get($$item).contrast;
		let placeholder = () => $.get($$item).placeholder;
		let size = () => $.get($$item).size;
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			let $0 = $.derived(() => getTexts().contrast);

			$.component(node_1, () => $$props.components.a11ySingleNotice, ($$anchor, components_a11ySingleNotice) => {
				components_a11ySingleNotice($$anchor, $.spread_props(trueColors, {
					get contrast() {
						return contrast();
					},

					get placeholder() {
						return placeholder();
					},

					get size() {
						return size();
					},

					get a11yLevel() {
						return $$props.a11yLevel;
					},

					get contrastText() {
						return $.get($0);
					}
				}));
			});
		}

		$.append($$anchor, fragment);
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();

			$.html(span_1, () => getTexts().guidelines, true);
			$.reset(span_1);
			$.append($$anchor, span_1);
		};

		var d = $.derived(() => getTexts().guidelines);

		$.if(node_2, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			styles = $.set_style(div, '', styles, { '--item-count': $.get(_a11yColors).length });
			$.set_text(text, $0);
		},
		[() => getTexts().nbGradeSummary($.get(count))]
	);

	$.append($$anchor, div);
	$.pop();
}