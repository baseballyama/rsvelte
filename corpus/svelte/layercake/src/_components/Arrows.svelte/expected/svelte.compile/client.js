import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onMount, tick } from 'svelte';
import { swoopyArrow, getElPosition, parseCssValue } from '../_modules/arrowUtils.js';

var root = $.from_svg(`<path marker-end="url(#arrowhead)" class="svelte-1pw0flr"></path>`);
var root_1 = $.from_svg(`<g class="swoops svelte-1pw0flr"></g>`);
var root_2 = $.from_svg(`<g><!></g>`);

export default function Arrows($$anchor, $$props) {
	$.push($$props, true);

	const $x = () => $.store_get(x, '$x', $$stores);
	const $y = () => $.store_get(y, '$y', $$stores);
	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $yScale = () => $.store_get(yScale, '$yScale', $$stores);
	const $xScale = () => $.store_get(xScale, '$xScale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// @ts-nocheck
	/**
	 * @typedef {Object} Annotation TODO: Add the schema for the annotation object.
	 */
	/**
	 * @typedef {Object} Props
	 * @property {Array<Annotation>} annotations - A list of annotation objects. See the [Column](https://layercake.graphics/example/Column) chart example for the schema and options.
	 * @property {string} [containerClass=".chart-container"] - The class name / CSS selector of the parent element of the `<LayerCake>` component. This is used to crawl the DOM for the text annotations.
	 * @property {string} [annotationClass=".layercake-annotation"] -The class name / CSS selector of the text annotation divs.
	 */
	/** @type {Props} */
	let containerClass = $.prop($$props, 'containerClass', 3, '.chart-container'),
		annotationClass = $.prop($$props, 'annotationClass', 3, '.layercake-annotation');

	let container = $.state(void 0);
	const { width, height, xScale, yScale, x, y } = getContext('LayerCake');

	/* --------------------------------------------
	 * Some lookups to convert between x, y / width, height terminology
	 * and CSS names
	 */
	const lookups = [
		{ dimension: 'width', css: 'left', position: 'x' },
		{ dimension: 'height', css: 'top', position: 'y' }
	];

	let annotationEls = $.state(void 0);

	// This searches the DOM for the HTML annotations
	// in the Annotations.svelte componenent and then
	// attaches arrows to those divs
	// Make sure the `.chart-container` and `.layercake-annotation`
	// selectors match what you have in your project
	// otherwise it won't find anything
	onMount(async () => {
		await tick();
		$.set(annotationEls, Array.from($.get(container).closest(containerClass()).querySelectorAll(annotationClass())), true);
	});

	function getArrowPath(anno, i, arrow) {
		if (!$.get(annotationEls) || !$.get(annotationEls)[i]) return '';

		const el = $.get(annotationEls)[i];

		/* --------------------------------------------
		 * Parse our attachment directives to know where to start the arrowhead
		 * measuring a bounding box based on our annotation el
		 */
		const arrowSource = getElPosition(el);

		const sourceCoords = arrow.source.anchor.split('-').map((q, j) => {
			const point = q === 'middle'
				? arrowSource[lookups[j].css] + arrowSource[lookups[j].dimension] / 2
				: arrowSource[q];

			return point + parseCssValue(arrow.source[`d${lookups[j].position}`], i, arrowSource.width, arrowSource.height);
		});

		/* --------------------------------------------
		 * Default to clockwise
		 */
		const clockwise = typeof arrow.clockwise === 'undefined' ? true : arrow.clockwise;

		/* --------------------------------------------
		 * Parse where we're drawing to
		 * If we're passing in a percentage as a string then we need to convert it to pixel values
		 * Otherwise pass it to our xGet and yGet functions
		 */
		const targetCoords = [
			arrow.target.x || $x()(arrow.target),
			arrow.target.y || $y()(arrow.target)
		].map((q, j) => {
			const val = typeof q === 'string' && q.includes('%')
				? parseCssValue(q, j, $width(), $height())
				: j ? $yScale()(q) : $xScale()(q);

			return val + (arrow.target[`d${lookups[j].position}`] || 0);
		});

		/* --------------------------------------------
		 * Create arrow path
		 */
		return swoopyArrow().angle(Math.PI / 2).clockwise(clockwise).x((q) => q[0]).y((q) => q[1])([sourceCoords, targetCoords]);
	}

	var g = root_2();
	var node = $.child(g);

	{
		var consequent_1 = ($$anchor) => {
			var g_1 = root_1();

			$.each(g_1, 21, () => $$props.annotations, $.index, ($$anchor, anno, i) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 17, () => $.get(anno).arrows, $.index, ($$anchor, arrow) => {
							var path = root();

							$.template_effect(($0) => $.set_attribute(path, 'd', $0), [() => getArrowPath($.get(anno), i, $.get(arrow))]);
							$.append($$anchor, path);
						});

						$.append($$anchor, fragment_1);
					};

					$.if(node_1, ($$render) => {
						if ($.get(anno).arrows) $$render(consequent);
					});
				}

				$.append($$anchor, fragment);
			});

			$.reset(g_1);
			$.append($$anchor, g_1);
		};

		$.if(node, ($$render) => {
			if ($$props.annotations.length) $$render(consequent_1);
		});
	}

	$.reset(g);
	$.bind_this(g, ($$value) => $.set(container, $$value), () => $.get(container));
	$.append($$anchor, g);
	$.pop();
	$$cleanup();
}