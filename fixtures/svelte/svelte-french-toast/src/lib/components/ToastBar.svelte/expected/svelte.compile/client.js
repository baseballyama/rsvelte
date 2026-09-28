import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { prefersReducedMotion } from '../core/utils';
import ToastIcon from './ToastIcon.svelte';
import ToastMessage from './ToastMessage.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function ToastBar($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, undefined),
		style = $.prop($$props, 'style', 3, ''),
		Component = $.prop($$props, 'Component', 3, undefined);

	let factor = $.derived(() => {
		const top = ($$props.toast.position || position() || 'top-center').includes('top');

		return top ? 1 : -1;
	});

	let animation = $.derived(() => {
		const [enter, exit] = prefersReducedMotion()
			? ['_sft-fadeIn', '_sft-fadeOut']
			: ['_sft-enter', '_sft-exit'];

		return $$props.toast.visible ? enter : exit;
	});

	var div = root_1();
	let styles;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				const icon = ($$anchor) => {
					ToastIcon($$anchor, {
						get toast() {
							return $$props.toast;
						}
					});
				};

				const message = ($$anchor) => {
					ToastMessage($$anchor, {
						get toast() {
							return $$props.toast;
						}
					});
				};

				$.component(node_1, Component, ($$anchor, Component_1) => {
					Component_1($$anchor, { icon, message, $$slots: { icon: true, message: true } });
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			$.snippet(node_2, () => $$props.children, () => ({ ToastIcon, ToastMessage, toast: $$props.toast }));
			$.append($$anchor, fragment_3);
		};

		var alternate = ($$anchor) => {
			var fragment_4 = root();
			var node_3 = $.first_child(fragment_4);

			ToastIcon(node_3, {
				get toast() {
					return $$props.toast;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			ToastMessage(node_4, {
				get toast() {
					return $$props.toast;
				}
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node, ($$render) => {
			if (Component()) $$render(consequent); else if ($$props.children) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `_sft-base ${($$props.toast.height ? $.get(animation) : '_sft-transparent') ?? ''} ${($$props.toast.className || '') ?? ''}`, 'svelte-l6lvp4');
		styles = $.set_style(div, `${style() ?? ''}; ${$$props.toast.style ?? ''}`, styles, { '--factor': $.get(factor) });
	});

	$.append($$anchor, div);
	$.pop();
}