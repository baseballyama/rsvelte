import * as $ from 'svelte/internal/server';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, tooltip } = $$props;
		let ref = void 0;
		let tooltipEl = void 0;
		let arrowEl = void 0;

		function showTooltip() {
			if (!tooltipEl) return;

			tooltipEl.style.display = 'block';
			update();
		}

		function hideTooltip() {
			if (!tooltipEl) return;

			tooltipEl.style.display = '';
		}

		async function update() {
			if (!ref || !tooltipEl || !arrowEl) return;

			const { x, y, placement, middlewareData } = await computePosition(ref, tooltipEl, {
				placement: 'top',
				middleware: [
					offset(2),
					flip(),
					shift({ padding: 5 }),
					arrow({ element: arrowEl })
				]
			});

			Object.assign(tooltipEl.style, { left: `${x}px`, top: `${y}px` });

			const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
			const staticSide = ({ top: 'bottom', right: 'left', bottom: 'top', left: 'right' })[placement.split('-')[0]];

			if (!staticSide) return;

			Object.assign(arrowEl.style, {
				left: arrowX == null ? '' : `${arrowX}px`,
				top: arrowY == null ? '' : `${arrowY}px`,
				right: '',
				bottom: '',
				[staticSide]: '-4px'
			});
		}

		$$renderer.push(`<div role="tooltip">`);
		children?.($$renderer);
		$$renderer.push(`<!----> <div class="tooltip svelte-dib29m" role="tooltip">`);
		tooltip?.($$renderer);
		$$renderer.push(`<!----> <div class="arrow svelte-dib29m"></div></div></div>`);
	});
}