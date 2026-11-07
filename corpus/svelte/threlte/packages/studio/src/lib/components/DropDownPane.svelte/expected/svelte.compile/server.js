import * as $ from 'svelte/internal/server';
import { arrow, computePosition, offset, shift } from '@floating-ui/dom';
import { Pane } from 'svelte-tweakpane-ui';
import IconButton from './IconButton.svelte';

export default function DropDownPane($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ref = void 0;
		let tooltipEl = void 0;
		let arrowEl = void 0;

		const show = () => {
			if (!tooltipEl) return;

			tooltipEl.style.display = 'block';
			update();
			visible = true;
		};

		const hide = () => {
			if (!tooltipEl) return;

			tooltipEl.style.display = 'none';
			visible = false;
		};

		let {
			placement = 'bottom',
			title = '',
			icon = 'mdiChevronDown',
			visible = false,
			toggle = () => {
				if (!visible) show(); else hide();
			},
			children
		} = $$props;

		async function update() {
			if (!ref || !tooltipEl || !arrowEl) return;

			const { x, y, placement: finalPlacement, middlewareData } = await computePosition(ref, tooltipEl, {
				placement,
				middleware: [
					offset(2),
					shift({ padding: 6 }),
					arrow({ element: arrowEl })
				]
			});

			Object.assign(tooltipEl.style, { left: `${x}px`, top: `${y}px` });

			const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
			const staticSide = ({ top: 'bottom', right: 'left', bottom: 'top', left: 'right' })[finalPlacement.split('-')[0]];

			if (!staticSide) return;

			Object.assign(arrowEl.style, {
				left: arrowX == null ? '' : `${arrowX}px`,
				top: arrowY == null ? '' : `${arrowY}px`,
				right: '',
				bottom: '',
				[staticSide]: '-4px'
			});
		}

		function clickOutside(element, callbackFunction) {
			function onClick(event) {
				if (event.target && !element.contains(event.target)) {
					callbackFunction();
				}
			}

			document.body.addEventListener('click', onClick);

			return {
				update(newCallbackFunction) {
					callbackFunction = newCallbackFunction;
				},

				destroy() {
					document.body.removeEventListener('click', onClick);
				}
			};
		}

		$$renderer.push(`<div style="display: contents;"><div>`);

		IconButton($$renderer, {
			icon,
			label: 'Toggle Pane',
			onclick: () => {
				toggle();
			}
		});

		$$renderer.push(`<!----></div> <div class="tooltip svelte-1gcd9w0" role="menu">`);

		Pane($$renderer, {
			position: 'inline',
			title,
			expanded: true,
			userExpandable: false,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="arrow svelte-1gcd9w0"></div></div></div>`);
		$.bind_props($$props, { visible, show, hide });
	});
}