import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let pending = $.state($.proxy([]));

	function createTogglePending() {
		const id = 1;

		const togglePending = () => {
			if ($.get(pending).includes(id)) {
				$.set(pending, $.get(pending).filter((p) => p !== id), true);
			} else {
				$.set(pending, [...$.get(pending), id], true);
			}
		};

		return { togglePending, id };
	}

	const toggle1 = createTogglePending();
	var button = root();
	var text = $.only_child(button);

	$.template_effect(($0) => $.set_text(text, `${toggle1.id ?? ''} / ${$0 ?? ''}`), [() => $.get(pending).includes(toggle1.id)]);

	$.event('click', button, function (...$$args) {
		toggle1.togglePending?.apply(this, $$args);
	});

	$.append($$anchor, button);
}