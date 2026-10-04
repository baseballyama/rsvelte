import { VaporFragment as $$v_VaporFragment, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, effectScope as $$v_effectScope, handleError as $$v_handleError, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, queuePostFlushCb as $$v_queuePostFlushCb, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template, unref as $$v_unref } from 'vue';

import { customRef as $$createState, useId as $$props_id } from 'vue';

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

const $$async_setup = (task) => {
	const instance = $$v_currentInstance;
	const scope = $$v_effectScope();
	const mounted = instance.__rsvelte_async_mount = [];
	const anchor = document.createComment('');
	const fragment = Object.assign(new $$v_VaporFragment([]), { anchor });
	const cancelled = Symbol();
	let active = true;
	let previous = null;
	const context = { suspend(value) {
		if (previous) {
			$$v_restoreCurrentInstance(previous);
			previous = null;
		} else $$v_setCurrentInstance(null, undefined);
		return value;
	}, resume(value) {
		if (!active) throw cancelled;
		previous = $$v_setCurrentInstance(instance, scope);
		return value;
	}, finish() {
		if (previous) {
			$$v_restoreCurrentInstance(previous);
			previous = null;
		}
	} };
	$$v_onScopeDispose(() => {
		active = false;
		scope.stop();
	});
	const result = scope.run(() => task(context));
	Promise.resolve(result).then((nodes) => {
		context.finish();
		if (!active) return;
		fragment.nodes = nodes;
		if (anchor.parentNode) $$v_insert(nodes, anchor.parentNode, anchor);
		delete instance.__rsvelte_async_mount;
		$$v_queuePostFlushCb(() => {
			if (active) mounted.forEach((callback) => callback());
		});
	}, (error) => {
		context.finish();
		if (active && error !== cancelled) $$v_handleError(error, instance, 'setup');
	});
	return fragment;
};

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>change</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p>');

const $$v_n10 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	return $$async_setup(async ($$async_context) => {
		try {
			const initial = $$async_context.resume(await $$async_context.suspend(Promise.resolve(2)));
			const uid = $$props_id();
			const count = $$ref(initial);
			const $$v_n1 = $$v_n0();
			const $$v_n3 = $$v_n2();
			const $$v_n4 = $$v_n3.firstChild;
			$$v_insert([$$v_n4], $$v_n1);
			$$v_on($$v_n1, 'click', () => count.value++);
			const $$v_n6 = $$v_n5();
			const $$v_n7 = $$v_n6.firstChild;
			const $$v_n9 = $$v_n8();
			const $$v_n11 = $$v_n10();
			$$v_insert([$$v_n11], $$v_n9);
			$$v_renderEffect(() => {
				$$v_setText($$v_n11, `${$$v_unref(uid).length > 0}:${count.value ?? ''}`);
			});
			return [$$v_n1, $$v_n7, $$v_n9];
		} finally {
			$$async_context.finish();
		}
	});
} });
