import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcLabelState } from './ArcLabel.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'Text',
	'getArcTextProps',
	'centroid',
	'startAngle',
	'endAngle',
	'innerRadius',
	'outerRadius',
	'placement',
	'startOffset',
	'outerPadding',
	'calloutLineLength',
	'calloutLabelOffset',
	'calloutPadding',
	'line',
	'offset'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function ArcLabel_base($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.prop($$props, 'placement', 3, 'centroid'),
		calloutLineLength = $.prop($$props, 'calloutLineLength', 3, 16),
		calloutLabelOffset = $.prop($$props, 'calloutLabelOffset', 3, 12),
		calloutPadding = $.prop($$props, 'calloutPadding', 3, 4),
		offset = $.prop($$props, 'offset', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new ArcLabelState(() => ({
		getArcTextProps: $$props.getArcTextProps,
		centroid: $$props.centroid,
		startAngle: $$props.startAngle,
		endAngle: $$props.endAngle,
		innerRadius: $$props.innerRadius,
		outerRadius: $$props.outerRadius,
		placement: placement(),
		startOffset: $$props.startOffset,
		outerPadding: $$props.outerPadding,
		calloutLineLength: calloutLineLength(),
		calloutLabelOffset: calloutLabelOffset(),
		calloutPadding: calloutPadding(),
		line: $$props.line,
		offset: offset()
	}));

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $$props.Path, ($$anchor, Path_1) => {
				Path_1($$anchor, $.spread_props(
					{
						get pathData() {
							return c.calloutGeometry.pathData;
						}
					},
					() => $$props.line
				));
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (placement() === 'callout' && c.calloutGeometry) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => $$props.Text, ($$anchor, Text_1) => {
		Text_1($$anchor, $.spread_props(() => c.arcTextProps, () => restProps));
	});

	$.append($$anchor, fragment);
	$.pop();
}