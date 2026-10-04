import { defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, template as $$v_template } from 'vue';

import { customRef as $$createState, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

const $$style = (element, name, value, important) => {
	if (value == null || value === '') element.style.removeProperty(name); else element.style.setProperty(name, value, important ? 'important' : '');
};

const $$style_value = (value, important) => value == null ? null : value + (important ? ' !important' : '');

const $$styles = (element, value, declarations) => {
	const changed = element.$$style_base !== value;
	if (changed) {
		element.$$style_base = value;
		const style = element.ownerDocument.createElement('div').style;
		style.cssText = value == null ? '' : String(value);
		const properties = Array.from(style);
		Object.keys(declarations).forEach((name) => {
			if (properties.includes(name)) style.removeProperty(name);
		});
		let css = style.cssText;
		Object.entries(declarations).forEach(([name, [value, important]]) => {
			if (value != null && value !== '') css += name + ':' + value + (important ? ' !important;' : ';');
		});
		if (css) element.style.cssText = css; else element.removeAttribute('style');
	}
	const previous = element.$$style_declarations;
	Object.keys(declarations).forEach((name) => {
		const [value, important] = declarations[name];
		if (!changed && (!previous || previous[name][0] !== value || previous[name][1] !== important)) {
			$$style(element, name, value, important);
		}
	});
	element.$$style_declarations = declarations;
};

const $$style_spread = (element, attributes, declarations) => {
	if (element) {
		const base = attributes.style;
		delete attributes.style;
		$$attributes(element, attributes);
		$$styles(element, base, declarations);
	} else {
		const style = $$v_normalizeStyle([attributes.style]) || {};
		Object.entries(declarations).forEach(([name, [value, important]]) => {
			if (value == null || value === '') delete style[name]; else style[name] = $$style_value(value, important);
		});
		attributes.style = Object.entries(style).map(([name, value]) => name + ':' + value).join(';');
	}
	return attributes;
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

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>toggle</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p>');

const $$v_n10 = $$v_template('<span>styles</span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const active = $$ref(false);
	const color = $$computed(() => active.value ? 'red' : 'blue');
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => active.value = !active.value);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	const $$v_n13 = ($$el) => {
		if ($$el !== null) {
			$$styles($$el, 'color:black;padding:1px', { 'color': [color.value, false], '--gap': [active.value ? '2px' : null, true], 'margin': [active.value ? '3px' : null, false] });
		}
	};
	$$v_onScopeDispose(() => $$v_n13(null));
	$$v_renderEffect(() => {
		$$v_n13($$v_n9);
	});
	return [$$v_n1, $$v_n7, $$v_n9];
} });
