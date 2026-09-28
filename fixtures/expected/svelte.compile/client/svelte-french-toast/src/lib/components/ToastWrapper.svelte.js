import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { prefersReducedMotion } from '../core/utils';
import ToastBar from './ToastBar.svelte';
import ToastMessage from './ToastMessage.svelte';

var root = $.from_html(`<div><!></div>`);

export default function ToastWrapper($$anchor, $$props) {
	$.push($$props, true);

	let clientHeight = $.state(void 0);

	onMount(() => {
		if ($.get(clientHeight) === undefined) return;

		$$props.setHeight($.get(clientHeight));
	});

	let top = $.derived(() => $$props.toast.position?.includes('top') ? 0 : null);
	let bottom = $.derived(() => $$props.toast.position?.includes('bottom') ? 0 : null);
	let factor = $.derived(() => $$props.toast.position?.includes('top') ? 1 : -1);
	let justifyContent = $.derived(() => $$props.toast.position?.includes('center') && 'center' || ($$props.toast.position?.includes('right') || $$props.toast.position?.includes('end')) && 'flex-end' || null);
	var div = root();
	let classes;
	let styles;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			ToastMessage($$anchor, {
				get toast() {
					return $$props.toast;
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => ({ toast: $$props.toast }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			ToastBar($$anchor, {
				get toast() {
					return $$props.toast;
				},

				get position() {
					return $$props.toast.position;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.toast.type === 'custom') $$render(consequent); else if ($$props.children) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			classes = $.set_class(div, 1, '_sft-wrapper svelte-148ohzq', null, classes, { '_sft-active': $$props.toast.visible, '_sft-transition': $0 });

			styles = $.set_style(div, '', styles, {
				'--factor': $.get(factor),
				'--offset': $$props.toast.offset,
				top: $.get(top),
				bottom: $.get(bottom),
				'justify-content': $.get(justifyContent)
			});
		},
		[() => !prefersReducedMotion()]
	);

	$.bind_element_size(div, 'clientHeight', ($$value) => $.set(clientHeight, $$value));
	$.append($$anchor, div);
	$.pop();
}