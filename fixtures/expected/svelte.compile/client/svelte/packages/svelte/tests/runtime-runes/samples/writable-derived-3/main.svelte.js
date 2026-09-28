import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class X {
		#in_constructor;

		get in_constructor() {
			return $.get(this.#in_constructor);
		}

		set in_constructor(value) {
			$.set(this.#in_constructor, value);
		}

		#x = $.state(1);

		get x() {
			return $.get(this.#x);
		}

		set x(value) {
			$.set(this.#x, value, true);
		}

		#on_class = $.derived(() => this.x * 2);

		get on_class() {
			return $.get(this.#on_class);
		}

		set on_class(value) {
			$.set(this.#on_class, value);
		}

		#on_class_private = $.derived(() => this.x * 2);
		#in_constructor_private;

		constructor() {
			this.#in_constructor_private = $.derived(() => this.x * 2);
			this.#in_constructor = $.derived(() => this.x * 2);
			$.set(this.#on_class_private, 3);
			$.set(this.#in_constructor_private, 3);
		}

		get on_class_private() {
			return $.get(this.#on_class_private);
		}

		get in_constructor_private() {
			return $.get(this.#in_constructor_private);
		}
	}

	const x = new X();

	x.on_class = 3;
	x.in_constructor = 3;
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${x.on_class ?? ''} ${x.in_constructor ?? ''} ${x.on_class_private ?? ''} ${x.in_constructor_private ?? ''}`));
	$.append($$anchor, text);
	$.pop();
}