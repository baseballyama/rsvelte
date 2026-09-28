import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Text, Circle } from 'layerchart';
import TextPlaygroundControls from '$lib/components/controls/TextPlaygroundControls.svelte';
import { toTitleCase } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><h2 class="text-center"> </h2> <div class="flex items-center justify-center bg-surface-100 p-4"><div class="h-56 border border-surface-content/10"><!></div></div></div>`);
var root_2 = $.from_html(`<!> <div class="grid grid-cols-3"></div>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		x: 0,
		y: 0,
		value: 'This is really long text',
		width: 300,
		textAnchor: 'start',
		verticalAnchor: 'start',
		lineHeight: '1em',
		rotate: 0,
		scaleToFit: false,
		showAnchor: true,
		resizeSvg: true,
		truncate: false,
		truncateOptions: { maxChars: 22, minChars: 0, ellipsis: '…', position: 'end' }
	}));

	const data = undefined;
	var $$exports = { data };
	var fragment = root_2();
	var node = $.first_child(fragment);

	TextPlaygroundControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var div = $.sibling(node, 2);

	$.each(div, 20, () => ['svg', 'canvas', 'html'], $.index, ($$anchor, type) => {
		var div_1 = root_1();
		var h2 = $.child(div_1);
		var text = $.only_child(h2, true);
		var div_2 = $.sibling(h2, 2);
		var div_3 = $.child(div_2);
		let styles;
		var node_1 = $.child(div_3);

		Chart(node_1, {
			height: 224,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					get type() {
						return type;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => $.get(config).truncate ? $.get(config).truncateOptions : false);

							Text(node_2, $.spread_props(() => $.get(config), {
								get truncate() {
									return $.get($0);
								}
							}));
						}

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent = ($$anchor) => {
								Circle($$anchor, {
									get cx() {
										return $.get(config).x;
									},

									get cy() {
										return $.get(config).y;
									},
									r: 2,
									fill: 'red'
								});
							};

							$.if(node_3, ($$render) => {
								if ($.get(config).showAnchor) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.reset(div_3);
		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_text(text, $0);

				styles = $.set_style(div_3, '', styles, {
					width: `${($.get(config).resizeSvg ? $.get(config).width : 300) ?? ''}px`
				});
			},
			[() => toTitleCase(type)]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}