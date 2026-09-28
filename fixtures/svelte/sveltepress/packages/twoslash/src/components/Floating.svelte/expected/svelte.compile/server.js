import * as $ from 'svelte/internal/server';
import { arrow, autoUpdate, computePosition, offset } from '@floating-ui/dom';
import { onMount } from 'svelte';
import teleport from '../actions/teleport.js';
import '@shikijs/twoslash/style-rich.css';

export default function Floating($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			show = false,
			alwaysShow = false,
			placement = 'bottom-start',
			floatingClass,
			content,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let container;
		let floatingContent;
		let arrowEl;

		const recomputePosition = (nextShow = show) => {
			if (alwaysShow || nextShow) {
				computePosition(container, floatingContent, {
					strategy: 'fixed',
					placement,
					middleware: [offset(5), arrow({ element: arrowEl })]
				}).then(({ x, y, middlewareData, placement }) => {
					Object.assign(floatingContent.style, { left: `${x}px`, top: `${y}px` });

					const side = placement.split('-')[0];
					const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };

					const translate = {
						top: 'translateY(-50%)',
						right: 'translateX(50%)',
						bottom: 'translateY(50%)',
						left: 'translateX(-50%)'
					};

					if (middlewareData.arrow) {
						Object.assign(arrowEl.style, {
							[staticSide[side]]: `${-arrowEl.offsetWidth}px`,
							borderWidth: `${side === 'bottom' || side === 'left' ? '1px' : 0} ${side === 'left' || side === 'top' ? '1px' : 0} ${side === 'top' || side === 'right' ? '1px' : 0} ${side === 'bottom' || side === 'right' ? '1px' : 0}`,
							transform: `${translate[side]} rotate(45deg)`
						});
					}
				});
			}
		};

		onMount(() => {
			recomputePosition();

			return autoUpdate(container, floatingContent, recomputePosition);
		});

		$$renderer.push(`<span${$.attributes({ class: 'container', role: 'tooltip', ...rest }, 'svelte-p2yhcs')}>`);
		children?.($$renderer);
		$$renderer.push(`<!----> <div${$.attr_class(`floating-content-wrapper ${floatingClass ? ` ${floatingClass}` : ''}`, 'svelte-p2yhcs', { 'always-show': alwaysShow, 'show': alwaysShow || show })} role="tooltip"><div class="arrow svelte-p2yhcs"></div> `);
		content?.($$renderer);
		$$renderer.push(`<!----></div></span>`);
	});
}