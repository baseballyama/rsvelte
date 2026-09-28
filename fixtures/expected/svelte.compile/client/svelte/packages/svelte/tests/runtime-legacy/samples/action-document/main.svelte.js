import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	let container;

	function tooltip(node, text) {
		let tooltip = null;

		function onVisibilityChange() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			container.appendChild(tooltip);
		}

		node.addEventListener('visibilitychange', onVisibilityChange);

		return {
			destroy() {
				node.removeEventListener('visibilitychange', onVisibilityChange);
			}
		};
	}

	var div = root();

	$.action($.document, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Perform an Action');
	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, div);
}