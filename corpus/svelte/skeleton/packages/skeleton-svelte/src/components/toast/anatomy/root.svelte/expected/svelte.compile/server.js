import * as $ from 'svelte/internal/server';
import { LocaleProviderRootContext } from '../../locale-provider/modules/root-context.js';
import { ToastGroupContext } from '../modules/group-context.js';
import { ToastRootContext } from '../modules/root-context.js';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
import { connect, machine } from '@zag-js/toast';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const group = ToastGroupContext.consume();
		const locale = LocaleProviderRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			toastProps = $.derived(() => props.toast),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'toast']));

		const service = useMachine(machine, () => ({ ...toastProps(), dir: locale().dir, parent: group() }));
		const toast = $.derived(() => connect(service, normalizeProps));
		const attributes = $.derived(() => mergeProps(toast().getRootProps(), rest()));

		ToastRootContext.provide(() => toast());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}><div${$.attributes({ ...toast().getGhostBeforeProps() })}></div> `);
			children()?.($$renderer);
			$$renderer.push(`<!----> <div${$.attributes({ ...toast().getGhostAfterProps() })}></div></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}