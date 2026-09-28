import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicInOut } from 'svelte/easing';
import { Arc, Chart, Layer } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tween_value_on_mount($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(void 0);

	const data = {
		arcs: [
			{
				initialValue: 0,
				value: 40,
				fillClass: 'fill-red-500',
				trackClass: 'fill-red-500/10'
			},

			{
				initialValue: 0,
				value: 60,
				fillClass: 'fill-lime-400',
				trackClass: 'fill-lime-400/10'
			},

			{
				initialValue: 0,
				value: 80,
				fillClass: 'fill-cyan-400',
				trackClass: 'fill-cyan-500/10'
			}
		]
	};

	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Arcs',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		height: 200,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => ({ type: 'tween', duration: 1000, easing: cubicInOut }));

								Arc(node_3, {
									initialValue: 0,
									value: 40,
									innerRadius: -20,
									cornerRadius: 10,
									class: 'fill-red-500',
									track: { class: 'fill-red-500/10' },
									get motion() {
										return $.get($0);
									}
								});
							}

							var node_4 = $.sibling(node_3, 2);

							{
								let $0 = $.derived(() => ({ type: 'tween', duration: 1000, easing: cubicInOut }));

								Arc(node_4, {
									initialValue: 0,
									value: 60,
									outerRadius: -25,
									innerRadius: -20,
									cornerRadius: 10,
									class: 'fill-lime-400',
									track: { class: 'fill-lime-400/10' },
									get motion() {
										return $.get($0);
									}
								});
							}

							var node_5 = $.sibling(node_4, 2);

							{
								let $0 = $.derived(() => ({ type: 'tween', duration: 1000, easing: cubicInOut }));

								Arc(node_5, {
									initialValue: 0,
									value: 80,
									outerRadius: -50,
									innerRadius: -20,
									cornerRadius: 10,
									class: 'fill-cyan-400',
									track: { class: 'fill-cyan-500/10' },
									get motion() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_2, ($$render) => {
							if ($.get(show)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}