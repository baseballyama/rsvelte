import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isGradeAchieved } from './grades.js';

var root = $.from_html(`<span>AAA</span>`);
var root_1 = $.from_html(`<p> </p> <div><p class="svelte-ybn3ap"> </p> <span>AA</span> <!></div>`, 1);

export default function A11ySingleNotice($$anchor, $$props) {
	$.push($$props, true);

	/** placeholder, falls back to `Lorem Ipsum` */
	/** size of the text */
	/** required WCAG contrast level */
	/** placeholder text color */
	/** placeholder background color */
	/** RGAA contrast between the text and its background. Between 1 and 21 */
	/** define the accessibility "contrast" text */
	let placeholder = $.prop($$props, 'placeholder', 3, undefined),
		size = $.prop($$props, 'size', 3, undefined),
		contrast = $.prop($$props, 'contrast', 3, 1);

	var fragment = root_1();
	var p = $.first_child(fragment);
	let classes;
	let styles;
	var text = $.only_child(p, true);
	var div = $.sibling(p, 2);
	var p_1 = $.child(div);
	var text_1 = $.only_child(p_1);
	var span = $.sibling(p_1, 2);
	let classes_1;
	var node = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();
			let classes_2;

			$.template_effect(($0) => classes_2 = $.set_class(span_1, 1, 'grade svelte-ybn3ap', null, classes_2, { 'grade-ok': $0 }), [() => isGradeAchieved(contrast(), size(), 'AAA')]);
			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($$props.a11yLevel === 'AAA') $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(p, 1, 'lorem svelte-ybn3ap', null, classes, { large: size() === 'large' });

			styles = $.set_style(p, '', styles, {
				color: $$props.textColor,
				'background-color': $$props.bgColor
			});

			$.set_text(text, placeholder() || 'Lorem Ipsum');
			$.set_text(text_1, `${$$props.contrastText ?? ''} ${$0 ?? ''}`);
			classes_1 = $.set_class(span, 1, 'grade svelte-ybn3ap', null, classes_1, { 'grade-ok': $1 });
		},
		[
			() => contrast() >= 10 ? contrast().toFixed(1) : contrast(),
			() => isGradeAchieved(contrast(), size(), 'AA')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}