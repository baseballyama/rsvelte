import { computed as $$v_computed, createKeyedFragment as $$v_createKeyedFragment, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template, unref as $$v_unref } from 'vue';

import { customRef as $$createState, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

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

const $$v_n2 = $$v_template('<footer>');

const $$v_n4 = $$v_template(' ');

const $$v_n6 = $$v_template('<button>');

const $$v_n8 = $$v_template(' ');

const $$v_n10 = $$v_template('<span> </span>');

const $$v_n13 = $$v_template('<p>');

const $$v_n15 = $$v_template(' ');

const $$v_n17 = $$v_template('<span> </span>');

const $$v_n20 = $$v_template('<span>');

const $$v_n22 = $$v_template(' ');

const $$v_n24 = $$v_template('<span> </span>');

const $$v_n27 = $$v_template('<output>');

const $$v_n29 = $$v_template('<span>effect</span>');

const $$v_n33 = $$v_template('<span> </span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const count = $$ref(0);
	const clicked = $$ref(false);
	const element = $$ref();
	const derived = $$computed(() => $$tracked(() => count.value + Number($$effect_tracking())));
	const derivedBy = $$computed(() => $$tracked(() => (() => count.value + Number($$effect_tracking()))()));
	const setup = $$effect_tracking();
	$$effect(() => {
		if (element.value) element.value.setAttribute('data-tracking', String($$effect_tracking()));
	});
	function $$snippet_6($$v_n0 = { value: undefined }) {
		const $$v_n1 = $$v_computed(() => $$tracked(() => {
			const value = $$v_n0.value === undefined ? $$tracked(() => 7) : $$v_n0.value;
			return [value];
		}));
		const value = $$v_computed(() => $$v_n1.value[0]);
		const $$v_n3 = $$v_n2();
		const $$v_n5 = $$v_n4();
		$$v_insert([$$v_n5], $$v_n3);
		$$v_renderEffect(() => {
			$$tracked(() => $$v_setText($$v_n5, `${value.value ?? ''}`));
		});
		return [$$v_n3];
	}
	const $$v_n7 = $$v_n6();
	const $$v_n9 = $$v_n8();
	$$v_insert([$$v_n9], $$v_n7);
	$$v_on($$v_n7, 'click', $$tracked(() => () => {
		clicked.value = $$effect_tracking();
		count.value++;
	}));
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	const $$v_n14 = $$v_n13();
	const $$v_n16 = $$v_n15();
	$$v_insert([$$v_n16], $$v_n14);
	const $$v_n18 = $$v_n17();
	const $$v_n19 = $$v_n18.firstChild;
	const $$v_n21 = $$v_n20();
	const $$v_n23 = $$v_n22();
	$$v_insert([$$v_n23], $$v_n21);
	const $$v_n25 = $$v_n24();
	const $$v_n26 = $$v_n25.firstChild;
	const $$v_n28 = $$v_n27();
	const $$v_n30 = $$v_n29();
	const $$v_n31 = $$v_n30.firstChild;
	$$v_insert([$$v_n31], $$v_n28);
	const $$v_n32 = ($$el) => {
		element.value = $$el;
	};
	$$v_renderEffect(() => $$tracked(() => $$v_n32($$v_n28)));
	$$v_onScopeDispose(() => $$v_n32(null));
	const $$v_n34 = $$v_n33();
	const $$v_n35 = $$v_n34.firstChild;
	const $$v_n36 = $$v_createKeyedFragment(() => $$snippet_6, () => $$snippet_6 ? $$snippet_6() : []);
	$$v_renderEffect(() => {
		$$tracked(() => $$v_setText($$v_n9, `${count.value ?? ''}`));
		$$tracked(() => $$v_setText($$v_n16, `${$$v_unref(setup) ?? ''}:${clicked.value ?? ''}:${$$effect_tracking() ?? ''}`));
		$$tracked(() => $$v_setText($$v_n23, `${derived.value}:${derivedBy.value}`));
	});
	return [[], $$v_n7, $$v_n12, $$v_n14, $$v_n19, $$v_n21, $$v_n26, $$v_n28, $$v_n35, $$v_n36];
} });
