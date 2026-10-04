import { currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, template as $$v_template } from 'vue';

import { shallowRef as $$shallowRef, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

const $$prop_cell = (props, key, fallback, server, bindable) => {
	const unset = Symbol();
	const local = server ? { value: unset } : $$shallowRef(unset);
	let previous = props[key];
	let initialized = false;
	let defaultValue;
	const options = { get() {
		const current = props[key];
		if (!Object.is(current, previous)) {
			previous = current;
			local.value = unset;
		}
		if (local.value !== unset) return local.value;
		if (current !== undefined) {
			initialized = false;
			return current;
		}
		if (!initialized) {
			initialized = true;
			defaultValue = $$untrack(fallback);
			if (bindable && !server) defaultValue = $$state_proxy(defaultValue);
			const write = bindable ? props.__rsvelte_bindings?.[key] : undefined;
			if (write && defaultValue !== undefined) {
				if (!server) throw new Error(`props_invalid_value: bound prop '${key}' cannot be undefined when it has a fallback`);
				write(defaultValue);
			}
		}
		return defaultValue;
	}, set(value) {
		if (bindable && !server) value = $$state_proxy(value);
		const write = bindable ? props.__rsvelte_bindings?.[key] : undefined;
		if (write) write(value); else local.value = value;
	} };
	if (!server) return $$createDerived(options);
	return { get value() {
		return options.get();
	}, set value(value) {
		options.set(value);
	} };
};

const $$effect_run = (callback, register, state) => {
	const scope = $$effectScope();
	state.failed = true;
	const cleanup = scope.run(() => $$tracked(callback));
	state.failed = false;
	state.cleanup = typeof cleanup === 'function' ? cleanup : null;
	register(() => {
		scope.stop();
		state.cleanup?.();
	});
};

const $$effect_watch = (callback, watch, options) => {
	const state = { cleanup: null, failed: false };
	$$onScopeDispose(() => {
		if (state.failed) state.cleanup?.();
	});
	const instance = $$v_currentInstance;
	const scope = $$v_getCurrentScope();
	watch((register) => {
		const previous = $$v_setCurrentInstance(instance, scope);
		try {
			$$effect_run(callback, register, state);
		} finally {
			$$v_restoreCurrentInstance(previous);
		}
	}, options);
};

const $$effect = (callback) => {
	if (typeof window !== 'undefined') $$effect_watch(callback, $$watchPostEffect);
};

const $$effect_pre = (callback) => {
	if (typeof window !== 'undefined') $$effect_watch(callback, $$watchEffect, { flush: 'pre' });
};

const $$effect_root = (callback) => {
	const scope = $$effectScope(true);
	const cleanup = scope.run(() => $$untrack(callback));
	let active = true;
	return () => {
		if (!active) return;
		active = false;
		scope.stop();
		if (typeof cleanup === 'function') cleanup();
	};
};

const $$snapshot = (value, seen = new Map(), original = null) => {
	if (value !== null && typeof value === 'object') {
		if (seen.has(value)) return seen.get(value);
		if (value instanceof Map) return new Map(value);
		if (value instanceof Set) return new Set(value);
		const array = Array.isArray(value);
		if (array || Object.getPrototypeOf(value) === Object.prototype) {
			const result = array ? Array(value.length) : {};
			seen.set(value, result);
			if (original !== null) seen.set(original, result);
			if (array) {
				for (let index = 0; index < value.length; index++) {
					if (index in value) result[index] = $$snapshot(value[index], seen);
				}
			} else {
				Object.keys(value).forEach((key) => {
					result[key] = $$snapshot(value[key], seen);
				});
			}
			return result;
		}
		if (value instanceof Date) {
			value.getTime();
			return structuredClone(value);
		}
		if (typeof value.toJSON === 'function') return $$snapshot(value.toJSON(), seen, value);
	}
	if (typeof EventTarget !== 'undefined' && value instanceof EventTarget) return value;
	try {
		return structuredClone(value);
	} catch {
		return value;
	}
};

let $$tracking_depth = 0;

const $$tracked = (callback) => {
	$$tracking_depth++;
	try {
		return callback();
	} finally {
		$$tracking_depth--;
	}
};

const $$effect_tracking = () => $$tracking_depth > 0;

const $$untrack = (callback) => {
	const depth = $$tracking_depth;
	$$tracking_depth = 0;
	const effect = new $$ReactiveEffect(callback);
	try {
		return effect.run();
	} finally {
		effect.stop();
		$$tracking_depth = depth;
	}
};

const $$v_n0 = $$v_template('<p>');

const $$v_n2 = $$v_template('<span>child</span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, props: { broken: { default: false }, record: {} }, setup(__props) {
	const $$props = __props;
	const record = $$prop_cell($$props, 'record', () => () => {}, false, false);
	$$effect(() => {
		if ($$props.broken) throw new Error('effect');
		record.value('run');
		return () => record.value('cleanup');
	});
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	return [$$v_n1];
} });
