import { computed as $$v_computed, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template, unref as $$v_unref } from 'vue';

import { customRef as $$createState, computed as $$createDerived, useAttrs as $$useAttrs, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

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

const $$make_derived = (server) => (getter) => {
	let value;
	let ready = false;
	if (server) {
		let override;
		return { get value() {
			if (override != null) return override;
			if (!ready) {
				value = getter();
				ready = true;
			}
			return value;
		}, set value(next) {
			override = next;
		} };
	}
	const effect = new $$ReactiveEffect(getter);
	const source = $$createState((track, trigger) => {
		let overridden = false;
		effect.notify = () => {
			if (effect.dirty) {
				ready = false;
				overridden = false;
				trigger();
			}
		};
		const read = () => {
			if (!ready && !overridden) {
				value = effect.run();
				ready = true;
			}
			return value;
		};
		return { get() {
			track();
			return read();
		}, set(next) {
			const previous = read();
			value = next;
			overridden = true;
			if (!Object.is(previous, next)) trigger();
		} };
	});
	return $$createDerived({ get: () => source.value, set: (next) => {
		source.value = next;
	} });
};

const $$computed = $$make_derived(false);

const $$v_n0 = $$v_template('<p>');

const $$v_n2 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, props: {}, setup(__props) {
	const $$props = __props;
	const $$attrs = $$rest_props($$useAttrs());
	const total = $$computed(() => $$attrs.count + 1);
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_computed(() => Object.keys($$v_unref($$attrs)).sort().join(','));
	$$v_insert([$$v_n3], $$v_n1);
	$$v_renderEffect(() => {
		$$v_n4.value;
		$$v_setText($$v_n3, `${$$v_unref($$attrs).count ?? ''}/${$$v_unref($$attrs).label ?? ''}/${total.value}/${$$v_n4.value ?? ''}`);
	});
	return [$$v_n1];
} });
