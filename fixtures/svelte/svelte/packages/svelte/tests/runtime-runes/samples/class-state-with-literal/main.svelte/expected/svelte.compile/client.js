import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Toggle {
		#aria_pressed = $.state(false);

		get "aria-pressed"() {
			return $.get(this.#aria_pressed);
		}

		set "aria-pressed"(value) {
			$.set(this.#aria_pressed, value, true);
		}

		toggle() {
			this["aria-pressed"] = !this["aria-pressed"];
		}
	}

	const toggle = new Toggle();
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, toggle["aria-pressed"]));
	$.event('click', button, () => toggle.toggle());
	$.append($$anchor, button);
	$.pop();
}