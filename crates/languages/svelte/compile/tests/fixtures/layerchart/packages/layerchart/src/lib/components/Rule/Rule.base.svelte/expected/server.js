import * as $ from 'svelte/internal/server';
import { pointRadial } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import { RuleState } from './Rule.shared.svelte.js';

export default function Rule_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Group,
			Line,
			Circle,
			data: dataProp,
			x = false,
			xOffset = 0,
			y = false,
			yOffset = 0,
			stroke: strokeProp,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new RuleState(() => ({ data: dataProp, x, xOffset, y, yOffset, stroke: strokeProp }));

		if (Group) {
			$$renderer.push('<!--[-->');

			Group($$renderer, {
				class: 'lc-rule-g',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(c.lines);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let line = each_array[$$index];
						const stroke = line.stroke ?? strokeProp;

						if (c.ctx.radial) {
							$$renderer.push('<!--[0-->');

							if (line.axis === 'x') {
								$$renderer.push('<!--[0-->');

								const [x1, y1] = pointRadial(line.x1, line.y1);
								const [x2, y2] = pointRadial(line.x2, line.y2);

								if (Line) {
									$$renderer.push('<!--[-->');

									Line($$renderer, $.spread_props([
										restProps,
										{
											x1,
											y1,
											x2,
											y2,
											stroke,
											class: cls('lc-rule-x-radial-line', className)
										}
									]));

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else if (line.axis === 'y') {
								$$renderer.push('<!--[1-->');

								if (Circle) {
									$$renderer.push('<!--[-->');

									Circle($$renderer, {
										r: line.y1,
										stroke,
										class: cls('lc-rule-y-radial-circle', className)
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (Line) {
								$$renderer.push('<!--[-->');

								Line($$renderer, $.spread_props([
									restProps,
									{
										x1: line.x1,
										y1: line.y1,
										x2: line.x2,
										y2: line.y2,
										stroke,
										class: cls(line.axis === 'x' ? 'lc-rule-x-line' : 'lc-rule-y-line', className)
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}