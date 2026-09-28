import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label class="nullability-checkbox svelte-16zqh08"><div class="svelte-16zqh08"><input type="checkbox" class="svelte-16zqh08"/> <span class="svelte-16zqh08"></span></div> </label>`);

export default function NullabilityCheckbox($$anchor, $$props) {
	$.push($$props, true);

	/** whether the color picker is undefined */
	/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
	let isUndefined = $.prop($$props, 'isUndefined', 15);

	var label = root();
	var div = $.child(label);
	var input = $.child(div);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div);

	var text = $.sibling(div);

	$.reset(label);
	$.template_effect(() => $.set_text(text, ` ${$$props.texts.label.withoutColor ?? ''}`));
	$.bind_checked(input, isUndefined);
	$.append($$anchor, label);
	$.pop();
}