import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<title> </title>`);
var root_1 = $.from_svg(`<circle><!></circle>`);
var root_2 = $.from_svg(`<g class="bee-group"></g>`);

export default function Beeswarm($$anchor, $$props) {
	$.push($$props, true);

	const $config = () => $.store_get(config, '$config', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $xGet = () => $.store_get(xGet, '$xGet', $$stores);
	const $zGet = () => $.store_get(zGet, '$zGet', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, xGet, zGet, height, config } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {number} [r=3] - The circle radius size in pixels.
	 * @property {number} [strokeWidth=0] - The circle's stroke width in pixels.
	 * @property {string} [stroke='#fff'] - The circle's stroke color.
	 * @property {number} [spacing=1.5] - Whitespace padding between each circle, in pixels
	 * @property {Function} [getTitle] - An accessor function to get the field on the data element to display as a hover label using a `<title>` tag.
	 */
	/** @type {Props} */
	let r = $.prop($$props, 'r', 3, 3),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0),
		stroke = $.prop($$props, 'stroke', 3, '#fff'),
		spacing = $.prop($$props, 'spacing', 3, 1.5);

	function dodge(data, { rds = 1, x = (d) => d } = {}) {
		const radius2 = rds ** 2;
		const circles = data.map((d) => ({ x: x(d), [$config().z]: d[$config().z], data: d })).sort((a, b) => a.x - b.x);
		const epsilon = 1e-3;
		let head = null, tail = null;

		// Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
		function intersects(x, y) {
			let a = head;

			while (a) {
				if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
					return true;
				}

				a = a.next;
			}

			return false;
		}

		// Place each circle sequentially.
		for (const b of circles) {
			// Remove circles from the queue that can’t intersect the new circle b.
			while (head && head.x < b.x - radius2) head = head.next;

			// Choose the minimum non-intersecting tangent.
			if (intersects(b.x, b.y = 0)) {
				let a = head;

				b.y = Infinity;

				do {
					let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);

					if (y < b.y && !intersects(b.x, y)) b.y = y;

					a = a.next;
				} while (a);
			}

			// Add b to the queue.
			b.next = null;

			if (head === null) head = tail = b; else {
				tail.next = b;
				tail = b;
			}
		}

		return circles;
	}

	let circles = $.derived(() => dodge($data(), { rds: r() * 2 + spacing() + strokeWidth(), x: $xGet() }));
	var g = root_2();

	$.each(g, 21, () => $.get(circles), $.index, ($$anchor, d) => {
		var circle = root_1();
		var node = $.child(circle);

		{
			var consequent = ($$anchor) => {
				var title = root();
				var text = $.only_child(title, true);

				$.template_effect(($0) => $.set_text(text, $0), [() => $$props.getTitle($.get(d))]);
				$.append($$anchor, title);
			};

			$.if(node, ($$render) => {
				if ($$props.getTitle) $$render(consequent);
			});
		}

		$.reset(circle);

		$.template_effect(
			($0) => {
				$.set_attribute(circle, 'fill', $0);
				$.set_attribute(circle, 'stroke', stroke());
				$.set_attribute(circle, 'stroke-width', strokeWidth());
				$.set_attribute(circle, 'cx', $.get(d).x);
				$.set_attribute(circle, 'cy', $height() - r() - spacing() - strokeWidth() / 2 - $.get(d).y);
				$.set_attribute(circle, 'r', r());
			},
			[() => $zGet()($.get(d))]
		);

		$.append($$anchor, circle);
	});

	$.reset(g);
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}