import { defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, setDOMProp as $$v_setDOMProp, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

const $$autofocused = new WeakSet();

const $$autofocus = (element, value) => {
	if ($$autofocused.has(element)) return;
	$$autofocused.add(element);
	if (value) {
		const body = document.body;
		element.autofocus = true;
		queueMicrotask(() => {
			if (document.activeElement === body) element.focus();
		});
	}
};

const $$hidden_values = new WeakMap();

const $$hidden = (element, value) => {
	if ($$hidden_values.has(element) && $$hidden_values.get(element) === value) return;
	$$hidden_values.set(element, value);
	if (value == null) element.removeAttribute('hidden'); else if (typeof value === 'string') element.setAttribute('hidden', value); else element.hidden = value;
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

const $$v_n2 = $$v_template('<span>next</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p>');

const $$v_n10 = $$v_template('<span>hidden</span>');

const $$v_n14 = $$v_template('<span> </span>');

const $$v_n17 = $$v_template('<p>');

const $$v_n19 = $$v_template('<span>findable</span>');

const $$v_n23 = $$v_template('<span> </span>');

const $$v_n26 = $$v_template('<details>');

const $$v_n28 = $$v_template('<summary>');

const $$v_n30 = $$v_template('<span>details</span>');

const $$v_n33 = $$v_template('<span>body</span>');

const $$v_n36 = $$v_template('<span> </span>');

const $$v_n39 = $$v_template('<input type="checkbox">');

const $$v_n41 = $$v_template('<span> </span>');

const $$v_n44 = $$v_template('<input>');

const $$v_n46 = $$v_template('<span> </span>');

const $$v_n49 = $$v_template('<div>');

const $$v_n51 = $$v_template('<span>inert</span>');

const $$v_n54 = $$v_template('<span> </span>');

const $$v_n57 = $$v_template('<video>');

const $$v_n60 = $$v_template('<span> </span>');

const $$v_n63 = $$v_template('<video>');

const $$v_n65 = $$v_template('<span> </span>');

const $$v_n68 = $$v_template('<output>');

const $$v_n70 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const index = $$ref(1);
	const values = [false, true, '', null, 0, 1, 'false'];
	const value = $$computed(() => values[index.value]);
	const video = $$ref();
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => index.value = (index.value + 1) % values.length);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	const $$v_n13 = ($$el) => {
		if ($$el !== null) {
			$$hidden($$el, value.value);
		}
	};
	$$v_renderEffect(() => $$v_n13($$v_n9));
	$$v_onScopeDispose(() => $$v_n13(null));
	const $$v_n15 = $$v_n14();
	const $$v_n16 = $$v_n15.firstChild;
	const $$v_n18 = $$v_n17();
	const $$v_n20 = $$v_n19();
	const $$v_n21 = $$v_n20.firstChild;
	$$v_insert([$$v_n21], $$v_n18);
	const $$v_n22 = ($$el) => {
		if ($$el !== null) {
			$$hidden($$el, index.value % 2 ? 'until-found' : false);
		}
	};
	$$v_renderEffect(() => $$v_n22($$v_n18));
	$$v_onScopeDispose(() => $$v_n22(null));
	const $$v_n24 = $$v_n23();
	const $$v_n25 = $$v_n24.firstChild;
	const $$v_n27 = $$v_n26();
	const $$v_n29 = $$v_n28();
	const $$v_n31 = $$v_n30();
	const $$v_n32 = $$v_n31.firstChild;
	$$v_insert([$$v_n32], $$v_n29);
	const $$v_n34 = $$v_n33();
	const $$v_n35 = $$v_n34.firstChild;
	$$v_insert([$$v_n29, $$v_n35], $$v_n27);
	const $$v_n37 = $$v_n36();
	const $$v_n38 = $$v_n37.firstChild;
	const $$v_n40 = $$v_n39();
	const $$v_n42 = $$v_n41();
	const $$v_n43 = $$v_n42.firstChild;
	const $$v_n45 = $$v_n44();
	const $$v_n47 = $$v_n46();
	const $$v_n48 = $$v_n47.firstChild;
	const $$v_n50 = $$v_n49();
	const $$v_n52 = $$v_n51();
	const $$v_n53 = $$v_n52.firstChild;
	$$v_insert([$$v_n53], $$v_n50);
	const $$v_n55 = $$v_n54();
	const $$v_n56 = $$v_n55.firstChild;
	const $$v_n58 = $$v_n57();
	const $$v_n59 = ($$el) => {
		video.value = $$el;
	};
	$$v_renderEffect(() => $$v_n59($$v_n58));
	$$v_onScopeDispose(() => $$v_n59(null));
	const $$v_n61 = $$v_n60();
	const $$v_n62 = $$v_n61.firstChild;
	const $$v_n64 = $$v_n63();
	const $$v_n66 = $$v_n65();
	const $$v_n67 = $$v_n66.firstChild;
	const $$v_n69 = $$v_n68();
	const $$v_n71 = $$v_n70();
	$$v_insert([$$v_n71], $$v_n69);
	$$v_renderEffect(() => {
		$$v_setDOMProp($$v_n27, 'open', Boolean(value.value));
		$$v_n40.checked = Boolean(value.value);
		$$v_setDOMProp($$v_n40, 'required', Boolean(value.value));
		$$v_setDOMProp($$v_n40, 'readOnly', Boolean(value.value));
		$$v_setDOMProp($$v_n45, 'multiple', Boolean(value.value));
		$$v_setDOMProp($$v_n45, 'webkitdirectory', Boolean(value.value));
		$$v_setDOMProp($$v_n50, 'inert', Boolean(value.value));
		$$v_setDOMProp($$v_n58, 'muted', Boolean(value.value));
		$$v_setDOMProp($$v_n58, 'playsInline', Boolean(value.value));
		$$v_setDOMProp($$v_n58, 'disablePictureInPicture', Boolean(value.value));
		$$v_setDOMProp($$v_n58, 'disableRemotePlayback', Boolean(value.value));
		$$v_setDOMProp($$v_n64, 'muted', Boolean(true));
		$$v_setText($$v_n71, `${index.value ?? ''}:${video.value?.muted ?? 'none' ?? ''}`);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n16, $$v_n18, $$v_n25, $$v_n27, $$v_n38, $$v_n40, $$v_n43, $$v_n45, $$v_n48, $$v_n50, $$v_n56, $$v_n58, $$v_n62, $$v_n64, $$v_n67, $$v_n69];
} });
