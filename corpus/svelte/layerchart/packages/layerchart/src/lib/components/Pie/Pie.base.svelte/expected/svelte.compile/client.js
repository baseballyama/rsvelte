import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieState } from './Pie.shared.svelte.js';

export default function Pie_base($$anchor, $$props) {
	$.push($$props, true);

	let cornerRadius = $.prop($$props, 'cornerRadius', 3, 0),
		padAngle = $.prop($$props, 'padAngle', 3, 0),
		offset = $.prop($$props, 'offset', 3, 0);

	const c = new PieState(() => ({
		data: $$props.data,
		range: $$props.range,
		startAngle: $$props.startAngle,
		endAngle: $$props.endAngle,
		innerRadius: $$props.innerRadius,
		outerRadius: $$props.outerRadius,
		cornerRadius: cornerRadius(),
		padAngle: padAngle(),
		motion: $$props.motion,
		offset: offset(),
		tooltip: $$props.tooltip,
		sort: $$props.sort
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => ({ arcs: c.arcs }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, () => c.arcs, $.index, ($$anchor, arc) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => c.ctx.config.c ? c.ctx.cScale?.(c.ctx.c($.get(arc).data)) : null);

					$.component(node_3, () => $$props.Arc, ($$anchor, Arc_1) => {
						Arc_1($$anchor, {
							class: 'lc-pie-arc',
							get startAngle() {
								return $.get(arc).startAngle;
							},

							get endAngle() {
								return $.get(arc).endAngle;
							},

							get padAngle() {
								return $.get(arc).padAngle;
							},

							get innerRadius() {
								return $$props.innerRadius;
							},

							get outerRadius() {
								return $$props.outerRadius;
							},

							get cornerRadius() {
								return cornerRadius();
							},

							get offset() {
								return offset();
							},

							get fill() {
								return $.get($0);
							},

							get data() {
								return $.get(arc).data;
							},

							get tooltip() {
								return $$props.tooltip;
							}
						});
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}