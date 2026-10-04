import { computed as $$v_computed, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, shallowRef as $$shallowRef, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

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

const $$state_marker = Symbol();

const $$state_deleted = Symbol();

const $$state_equal = (left, right) => left === right || left !== left && right !== right;

const $$state_source = (initial, convert = false) => {
	let current = initial;
	const source = $$createState((track, trigger) => ({ get() {
		track();
		return current;
	}, set(value) {
		const next = convert ? $$state_proxy(value) : value;
		if (!$$state_equal(current, next)) {
			current = next;
			trigger();
		}
	} }));
	source.peek = () => current;
	return source;
};

const $$ref = (value) => $$state_source($$state_proxy(value), true);

const $$state_proxy = (value) => {
	if (value === null || typeof value !== 'object' || $$state_marker in value) return value;
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== Array.prototype) return value;
	const array = Array.isArray(value);
	const sources = new Map();
	const version = $$state_source(0);
	let revision = 0;
	const changed = () => {
		version.value = ++revision;
	};
	const write = (property, next) => {
		let source = sources.get(property);
		if (!source) {
			source = $$state_source(next);
			sources.set(property, source);
		} else source.value = next;
	};
	if (array) sources.set('length', $$state_source(value.length));
	return new Proxy(value, { get(target, property, receiver) {
		if (property === $$state_marker) return target;
		let source = sources.get(property);
		const exists = property in target;
		if (!source && (!exists || Object.getOwnPropertyDescriptor(target, property)?.writable)) {
			source = $$state_source(exists ? $$state_proxy(target[property]) : $$state_deleted);
			sources.set(property, source);
		}
		if (!source) return Reflect.get(target, property, receiver);
		const result = source.value;
		return result === $$state_deleted ? undefined : result;
	}, set(target, property, next, receiver) {
		const source = sources.get(property);
		const existed = source ? source.peek() !== $$state_deleted : property in target;
		if (array && property === 'length') {
			const length = sources.get('length').peek();
			for (let index = next; index < length; index++) {
				if (sources.has(String(index)) || index in target) write(String(index), $$state_deleted);
			}
		}
		const descriptor = Object.getOwnPropertyDescriptor(target, property);
		if (source || !existed || descriptor?.writable) write(property, $$state_proxy(next));
		if (descriptor?.set) descriptor.set.call(receiver, next);
		if (!existed) {
			if (array && typeof property === 'string') {
				const index = Number(property);
				const length = sources.get('length');
				if (Number.isInteger(index) && index >= length.peek()) length.value = index + 1;
			}
			changed();
		}
		return true;
	}, deleteProperty(target, property) {
		if (sources.has(property) || property in target) {
			write(property, $$state_deleted);
			changed();
		}
		return true;
	}, has(target, property) {
		if (property === $$state_marker) return true;
		let source = sources.get(property);
		const exists = Reflect.has(target, property);
		if (!source && (!exists || Object.getOwnPropertyDescriptor(target, property)?.writable)) {
			source = $$state_source(exists ? $$state_proxy(target[property]) : $$state_deleted);
			sources.set(property, source);
		}
		return source ? source.value !== $$state_deleted : exists;
	}, ownKeys(target) {
		version.value;
		const keys = Reflect.ownKeys(target).filter((key) => !sources.has(key) || sources.get(key).peek() !== $$state_deleted);
		sources.forEach((source, key) => {
			if (source.peek() !== $$state_deleted && !(key in target)) keys.push(key);
		});
		return keys;
	}, getOwnPropertyDescriptor(target, property) {
		this.has(target, property);
		const descriptor = Object.getOwnPropertyDescriptor(target, property);
		const source = sources.get(property);
		if (!source) return descriptor;
		const current = source.value;
		if (current === $$state_deleted) return undefined;
		if (descriptor && 'value' in descriptor) return { ...descriptor, value: current };
		return { value: current, writable: true, enumerable: true, configurable: true };
	}, defineProperty(target, property, descriptor) {
		if (!('value' in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
			throw new TypeError('state_descriptors_fixed');
		}
		write(property, descriptor.value);
		return true;
	}, setPrototypeOf() {
		throw new TypeError('state_prototype_fixed');
	} });
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

const $$v_n2 = $$v_template(' ');

const $$v_n6 = $$v_template('<span> </span>');

const $$v_n9 = $$v_template('<button class="mutate">');

const $$v_n11 = $$v_template('<span>mutate</span>');

const $$v_n14 = $$v_template('<span> </span>');

const $$v_n17 = $$v_template('<button class="tick">');

const $$v_n19 = $$v_template('<span>tick</span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, props: { object: {}, list: {}, callback: {} }, setup(__props) {
	const $$props = __props;
	const object = $$prop_cell($$props, 'object', () => ({ count: base }), false, false);
	const list = $$prop_cell($$props, 'list', () => [base, base + 1], false, false);
	const callback = $$prop_cell($$props, 'callback', () => (value) => value + base, false, false);
	const base = 4;
	const tick = $$ref(0);
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_computed(() => callback.value(tick.value));
	const $$v_n5 = $$v_computed(() => list.value.join(','));
	$$v_insert([$$v_n3], $$v_n1);
	const $$v_n7 = $$v_n6();
	const $$v_n8 = $$v_n7.firstChild;
	const $$v_n10 = $$v_n9();
	const $$v_n12 = $$v_n11();
	const $$v_n13 = $$v_n12.firstChild;
	$$v_insert([$$v_n13], $$v_n10);
	$$v_on($$v_n10, 'click', () => {
		object.value.count++;
		list.value.push(9);
	});
	const $$v_n15 = $$v_n14();
	const $$v_n16 = $$v_n15.firstChild;
	const $$v_n18 = $$v_n17();
	const $$v_n20 = $$v_n19();
	const $$v_n21 = $$v_n20.firstChild;
	$$v_insert([$$v_n21], $$v_n18);
	$$v_on($$v_n18, 'click', () => tick.value++);
	$$v_renderEffect(() => {
		$$v_n5.value;
		$$v_n4.value;
		$$v_setText($$v_n3, `${object.value.count ?? ''}/${$$v_n5.value ?? ''}/${$$v_n4.value ?? ''}/${tick.value ?? ''}`);
	});
	return [$$v_n1, $$v_n8, $$v_n10, $$v_n16, $$v_n18];
} });
