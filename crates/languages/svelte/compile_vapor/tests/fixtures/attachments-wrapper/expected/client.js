import { createDynamicComponent as $$v_createDynamicComponent, defineVaporComponent as $$v_defineVaporComponent, unref as $$v_unref } from 'vue';

import { useAttrs as $$useAttrs } from 'vue';

const $$rest_props = (attrs) => new Proxy(attrs, { get(target, key) {
	if (typeof key === 'symbol' && key.description === '@attach') return target.__rsvelte_attachments?.[key];
	return Reflect.get(target, key);
}, has(target, key) {
	if (typeof key === 'symbol' && key.description === '@attach') return key in (target.__rsvelte_attachments ?? {});
	return key !== '__rsvelte_attachments' && Reflect.has(target, key);
}, ownKeys(target) {
	return Reflect.ownKeys(target).filter((key) => key !== '__rsvelte_attachments').concat(Object.getOwnPropertySymbols(target.__rsvelte_attachments ?? {}));
}, getOwnPropertyDescriptor(target, key) {
	if (typeof key === 'symbol' && key.description === '@attach') {
		const value = target.__rsvelte_attachments?.[key];
		if (key in (target.__rsvelte_attachments ?? {})) return { configurable: true, enumerable: true, value };
		return undefined;
	}
	if (key === '__rsvelte_attachments') return undefined;
	return Reflect.getOwnPropertyDescriptor(target, key);
} });

const $$component_props = (props) => {
	if (props == null) return {};
	const attachments = { ...props.__rsvelte_attachments };
	Object.getOwnPropertySymbols(props).forEach((key) => {
		if (key.description === '@attach') attachments[key] = props[key];
	});
	if (!Object.getOwnPropertySymbols(attachments).length) return props;
	return { ...props, __rsvelte_attachments: attachments };
};

import Child from '../attachments-child/input.svelte';

export default $$v_defineVaporComponent({ inheritAttrs: false, props: {}, setup(__props) {
	const $$props = __props;
	const $$attrs = $$rest_props($$useAttrs());
	const $$v_n0 = $$v_createDynamicComponent(() => $$v_unref(Child), { $: [() => $$component_props({ ...$$v_unref($$attrs) })] });
	return [$$v_n0];
} });
