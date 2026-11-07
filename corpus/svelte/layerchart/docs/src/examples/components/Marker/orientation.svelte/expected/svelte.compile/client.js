import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline, Layer } from 'layerchart';
import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <div class="grid gap-2"><div>default (auto)</div> <!> <div>0&deg;</div> <!> <div>90&deg;</div> <!></div>`, 1);

export default function Orientation($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		show: false,
		tweened: true,
		pathGenerator: (x) => x,
		curve: undefined,
		pointCount: 10,
		amplitude: 1,
		frequency: 10,
		phase: 0
	}));

	const data = $.derived(() => Array.from({ length: $.get(config).pointCount }).map((_, i) => {
		return {
			x: i + 1,
			y: $.get(config).pathGenerator(i / $.get(config).pointCount) ?? i
		};
	}));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	MarkerControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var div = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div), 2);

	Chart(node_1, {
		get data() {
			return $.get(data);
		},
		x: 'x',
		y: 'y',
		height: 200,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(config).tweened ? 'tween' : 'none');

								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},
									class: 'stroke-primary stroke-2',
									marker: { type: 'line', class: 'stroke-2 stroke-accent' },
									get motion() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_2, ($$render) => {
							if ($.get(config).show) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 4);

	Chart(node_3, {
		get data() {
			return $.get(data);
		},
		x: 'x',
		y: 'y',
		height: 200,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(config).tweened ? 'tween' : 'none');

								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},
									class: 'stroke-primary stroke-2',
									marker: { type: 'line', orient: 0, class: 'stroke-2 stroke-accent' },
									get motion() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_4, ($$render) => {
							if ($.get(config).show) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_3, 4);

	Chart(node_5, {
		get data() {
			return $.get(data);
		},
		x: 'x',
		y: 'y',
		height: 200,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = $.comment();
					var node_6 = $.first_child(fragment_8);

					{
						var consequent_2 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(config).tweened ? 'tween' : 'none');

								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},
									class: 'stroke-primary stroke-2',
									marker: { type: 'line', orient: 90, class: 'stroke-2 stroke-accent' },
									get motion() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_6, ($$render) => {
							if ($.get(config).show) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}