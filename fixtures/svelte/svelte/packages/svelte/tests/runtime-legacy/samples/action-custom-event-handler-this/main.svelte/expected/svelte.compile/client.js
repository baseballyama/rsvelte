import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor) {
	function enter(node, callback) {
		function handleKeydown(event) {
			if (event.key === 'Enter') {
				callback(event);
			}
		}

		node.addEventListener('keydown', handleKeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	}

	var input = root();

	$.action(input, ($$node, $$action_arg) => enter?.($$node, $$action_arg), () => (e) => e.target.blur());
	$.append($$anchor, input);
}