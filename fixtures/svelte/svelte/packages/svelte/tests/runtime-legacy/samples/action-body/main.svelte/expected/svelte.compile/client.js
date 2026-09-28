import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	let container;

	function tooltip(node, text) {
		let tooltip = null;

		function onMouseEnter() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			container.appendChild(tooltip);
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

	var div = root();

	$.action($.document.body, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Perform an Action');
	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, div);
}