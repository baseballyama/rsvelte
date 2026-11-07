import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <span> </span>`, 1);

export default function Main($$anchor) {
	const libFreezesObjects = true;

	function someLibFunctionCreatingFroozenObject(value) {
		if (libFreezesObjects) {
			return Object.freeze({ inner: value });
		} else {
			return { inner: value };
		}
	}

	function someLibFunctionReturningInner(wrapped) {
		return wrapped.inner;
	}

	function atom(init = null) {
		let el = $.proxy({ value: someLibFunctionCreatingFroozenObject(init) });

		return {
			get value() {
				return someLibFunctionReturningInner(el.value);
			},

			set value(v) {
				el.value = someLibFunctionCreatingFroozenObject(v);
			}
		};
	}

	let val = atom('hello');
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var span = $.sibling(input, 2);
	var text = $.only_child(span, true);

	$.template_effect(() => $.set_text(text, val.value));
	$.bind_value(input, () => val.value, ($$value) => val.value = $$value);
	$.append($$anchor, fragment);
}