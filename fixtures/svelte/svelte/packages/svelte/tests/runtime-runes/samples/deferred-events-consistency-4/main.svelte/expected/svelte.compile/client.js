import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Main($$anchor) {
	let toggle = $.state(false);

	function action(element) {
		const handle = () => {
			console.log('failed');
		};

		element.addEventListener('click', handle);

		return {
			update(toggle) {
				if (toggle) {
					element.removeEventListener('click', handle);
				}
			}
		};
	}

	var button = root();

	$.action(button, ($$node, $$action_arg) => action?.($$node, $$action_arg), () => $.get(toggle));

	$.delegated('mouseup', button, () => {
		$.set(toggle, true);
	});

	$.append($$anchor, button);
}

$.delegate(['mouseup']);