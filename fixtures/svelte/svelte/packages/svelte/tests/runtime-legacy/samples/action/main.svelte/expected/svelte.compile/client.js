import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>action</button>`);

export default function Main($$anchor) {
	function tooltip(node, text) {
		let tooltip = null;

		function onMouseEnter() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			node.parentNode.appendChild(tooltip);
		}

		function onMouseLeave() {
			if (!tooltip) return;

			tooltip.remove();
			tooltip = null;
		}

		node.addEventListener('mouseenter', onMouseEnter);
		node.addEventListener('mouseleave', onMouseLeave);

		return {
			destroy() {
				node.removeEventListener('mouseenter', onMouseEnter);
				node.removeEventListener('mouseleave', onMouseLeave);
			}
		};
	}

	var button = root();

	$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Perform an Action');
	$.append($$anchor, button);
}