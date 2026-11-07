import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let foo = () => 1;

	var bar = function () {
		return 2;
	};

	function update() {
		foo = () => 3;
		bar = () => 4;
	}

	var $$exports = { update };

	$.next();

	var text = $.text();

	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}-${$1 ?? ''}`), [() => foo(), () => bar()]);
	$.append($$anchor, text);

	return $.pop($$exports);
}