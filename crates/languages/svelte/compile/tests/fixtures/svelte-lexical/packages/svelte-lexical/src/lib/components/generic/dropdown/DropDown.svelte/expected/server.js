import * as $ from 'svelte/internal/server';
import { CAN_USE_DOM } from '@lexical/utils';
import DropDownItems from './DropDownItems.svelte';
import Portal from '../portal/Portal.svelte';
import { isDOMNode } from 'lexical';

export default function DropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			disabled = false,
			buttonAriaLabel = undefined,
			buttonClassName,
			buttonIconClassName = undefined,
			buttonLabel = undefined,
			stopCloseOnClickSelf = false,
			title = undefined,
			children,
			target = undefined
		} = $$props;

		let dropDownRef = void 0;
		let buttonRef = void 0;
		let showDropDown = false;

		function handleClose() {
			showDropDown = false;

			if (buttonRef) {
				buttonRef.focus();
			}
		}

		const handle = (event) => {
			const target = event.target;

			if (!isDOMNode(target)) {
				return;
			}

			if (stopCloseOnClickSelf) {
				if (dropDownRef && dropDownRef.contains(target)) return;
			}

			if (buttonRef && !buttonRef.contains(target)) {
				showDropDown = false;
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<button type="button"${$.attr('disabled', disabled, true)}${$.attr('aria-label', buttonAriaLabel || buttonLabel)}${$.attr_class($.clsx(buttonClassName))}${$.attr('title', title)}>`);

			if (buttonIconClassName) {
				$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(buttonIconClassName))}></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (buttonLabel) {
				$$renderer.push(`<!--[0--><span class="text dropdown-button-text">${$.escape(buttonLabel)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <i class="chevron-down"></i></button> `);

			if (showDropDown) {
				$$renderer.push('<!--[0-->');

				Portal($$renderer, {
					target,
					children: ($$renderer) => {
						DropDownItems($$renderer, {
							onClose: handleClose,
							get dropDownRef() {
								return dropDownRef;
							},

							set dropDownRef($$value) {
								dropDownRef = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								children?.($$renderer);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}