import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Values {
		#or = $.state('truthy');
		#and = $.state('');
		#nullish = $.state('value');

		get or() {
			return $.get(this.#or) || $.set(this.#or, 'assigned');
		}

		get and() {
			return $.get(this.#and) && $.set(this.#and, 'assigned');
		}

		get nullish() {
			return $.get(this.#nullish) ?? $.set(this.#nullish, 'assigned');
		}
	}

	const values = new Values();
	const result = $.derived(() => [values.or, values.and, values.nullish]);
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => $.get(result).join('|')]);
	$.append($$anchor, p);
	$.pop();
}