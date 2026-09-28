import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import useToaster from '../core/use-toaster';
import ToastWrapper from './ToastWrapper.svelte';

var root = $.from_html(`<div role="alert"></div>`);

export default function Toaster($$anchor, $$props) {
	$.push($$props, true);

	const $toasts = () => $.store_get(toasts, '$toasts', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let reverseOrder = $.prop($$props, 'reverseOrder', 3, false),
		position = $.prop($$props, 'position', 3, 'top-center'),
		toastOptions = $.prop($$props, 'toastOptions', 3, undefined),
		gutter = $.prop($$props, 'gutter', 3, 8),
		containerStyle = $.prop($$props, 'containerStyle', 3, undefined),
		containerClassName = $.prop($$props, 'containerClassName', 3, undefined);

	const { toasts, handlers } = useToaster(toastOptions());

	let _toasts = $.derived(() => $toasts().map((toast) => ({
		...toast,
		position: toast.position || position(),
		offset: handlers.calculateOffset(toast, $toasts(), {
			reverseOrder: reverseOrder(),
			gutter: gutter(),
			defaultPosition: position()
		})
	})));

	var div = root();

	$.each(div, 21, () => $.get(_toasts), (toast) => toast.id, ($$anchor, toast) => {
		ToastWrapper($$anchor, {
			get toast() {
				return $.get(toast);
			},
			setHeight: (height) => handlers.updateHeight($.get(toast).id, height)
		});
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `_sft-toaster ${(containerClassName() || '') ?? ''}`, 'svelte-1kymlcg');
		$.set_style(div, containerStyle());
	});

	$.event('mouseenter', div, function (...$$args) {
		handlers.startPause?.apply(this, $$args);
	});

	$.event('mouseleave', div, function (...$$args) {
		handlers.endPause?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}