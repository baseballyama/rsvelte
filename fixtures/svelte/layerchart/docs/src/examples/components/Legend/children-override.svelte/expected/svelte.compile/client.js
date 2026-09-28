import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';
import { Legend } from 'layerchart';

var root = $.from_html(`<div class="flex gap-1"><div class="h-4 w-4 rounded-full"></div> <div class="text-xs text-surface-content/50"> </div></div>`);
var root_1 = $.from_html(`<div class="flex gap-4"></div>`);

export default function Children_override($$anchor, $$props) {
	$.push($$props, true);

	{
		const children = ($$anchor, $$arg0) => {
			let scale = () => ($$arg0?.()).scale;
			let values = () => ($$arg0?.()).values;
			var div = root_1();

			$.each(div, 21, values, $.index, ($$anchor, value) => {
				var div_1 = root();
				var div_2 = $.child(div_1);
				let styles;
				var div_3 = $.sibling(div_2, 2);
				var text = $.only_child(div_3, true);

				$.reset(div_1);

				$.template_effect(
					($0) => {
						styles = $.set_style(div_2, '', styles, { 'background-color': $0 });
						$.set_text(text, $.get(value));
					},
					[() => scale()?.($.get(value))]
				);

				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => scaleOrdinal(
			[
				'<10',
				'10-19',
				'20-29',
				'30-39',
				'40-49',
				'50-59',
				'60-69',
				'70-79',
				'≥80'
			],
			schemeSpectral[10]
		));

		Legend($$anchor, {
			get scale() {
				return $.get($0);
			},
			title: 'Age (years)',
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}