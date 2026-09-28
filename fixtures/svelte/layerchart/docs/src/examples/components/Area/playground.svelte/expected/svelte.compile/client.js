import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Points, Layer } from 'layerchart';
import AreaPlaygroundControls from '$lib/components/controls/AreaPlaygroundControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		pathGenerator: (x) => x,
		curve: undefined,
		pointCount: 10,
		showPoints: false,
		showLine: true,
		show: true,
		tweened: true
	}));

	const motion = $.derived(() => $.get(config).tweened ? 'tween' : 'none');

	const data = $.derived(() => Array.from({ length: $.get(config).pointCount }).map((_, i) => {
		return {
			x: i + 1,
			y: $.get(config).pathGenerator?.(i / $.get(config).pointCount) ?? i
		};
	}));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	AreaPlaygroundControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		get data() {
			return $.get(data);
		},
		x: 'x',
		y: 'y',
		yNice: true,
		padding: 20,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(config).showLine && { class: 'stroke-primary stroke-2' });

								Area(node_5, {
									get curve() {
										return $.get(config).curve;
									},

									get line() {
										return $.get($0);
									},

									get motion() {
										return $.get(motion);
									},
									class: 'fill-primary/10'
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								var consequent = ($$anchor) => {
									Points($$anchor, {
										get motion() {
											return $.get(motion);
										},
										r: 3,
										class: 'fill-surface-100 stroke-primary'
									});
								};

								$.if(node_6, ($$render) => {
									if ($.get(config).showPoints) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_4, ($$render) => {
							if ($.get(config).show) $$render(consequent_1);
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