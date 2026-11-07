import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label class="svelte-159r51c"><div class="container svelte-159r51c"><input type="color" aria-haspopup="dialog" class="svelte-159r51c"/> <div class="alpha svelte-159r51c"></div> <div class="color svelte-159r51c"></div></div> </label>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	/** DOM element of the label wrapper */
	/** hex color */
	/** input label */
	/** input name, useful in a native form */
	/** directionality left to right, or right to left*/
	let labelElement = $.prop($$props, 'labelElement', 15),
		name = $.prop($$props, 'name', 3, undefined);

	function preventDefault(e) {
		e.preventDefault();

		/* prevent browser color picker from opening unless javascript is broken */
	}

	var label_1 = root();
	var div = $.child(label_1);
	var input = $.child(div);

	$.remove_input_defaults(input);

	var div_1 = $.sibling(input, 4);
	let styles;

	$.reset(div);

	var text = $.sibling(div);

	$.reset(label_1);
	$.bind_this(label_1, ($$value) => labelElement($$value), () => labelElement());

	$.template_effect(() => {
		$.set_attribute(label_1, 'dir', $$props.dir);
		$.set_attribute(input, 'name', name());
		$.set_value(input, $$props.hex);
		styles = $.set_style(div_1, '', styles, { background: $$props.hex });
		$.set_text(text, ` ${$$props.label ?? ''}`);
		label_1.dir = label_1.dir;
	});

	$.delegated('click', label_1, preventDefault);
	$.delegated('mousedown', label_1, preventDefault);
	$.delegated('click', input, preventDefault);
	$.delegated('mousedown', input, preventDefault);
	$.append($$anchor, label_1);
	$.pop();
}

$.delegate(['click', 'mousedown']);