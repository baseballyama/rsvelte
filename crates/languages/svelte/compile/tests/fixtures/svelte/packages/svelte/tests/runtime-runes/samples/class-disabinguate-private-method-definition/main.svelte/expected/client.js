import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Repo {
		#_tree = $.state();

		get tree() {
			return $.get(this.#_tree);
		}

		set tree(value) {
			$.set(this.#_tree, value, true);
		}

		async #tree() {}
	}

	const repo = new Repo();

	$.pop();
}