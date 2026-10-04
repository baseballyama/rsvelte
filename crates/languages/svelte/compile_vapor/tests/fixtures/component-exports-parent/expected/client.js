import { createDynamicComponent as $$v_createDynamicComponent, createIf as $$v_createIf, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, setTemplateRefBinding as $$v_setTemplateRefBinding, setText as $$v_setText, template as $$v_template, unref as $$v_unref } from 'vue';

import { customRef as $$createState, shallowRef as $$shallowRef } from 'vue';

const $$component_props = (props) => {
	if (props == null) return {};
	const attachments = { ...props.__rsvelte_attachments };
	Object.getOwnPropertySymbols(props).forEach((key) => {
		if (key.description === '@attach') attachments[key] = props[key];
	});
	if (!Object.getOwnPropertySymbols(attachments).length) return props;
	return { ...props, __rsvelte_attachments: attachments };
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

import Child from '../component-exports-child/input.svelte';

const $$v_n0 = $$v_template('<button id="increase">');

const $$v_n2 = $$v_template('<span>increase</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<button id="toggle">');

const $$v_n10 = $$v_template('<span>toggle</span>');

const $$v_n13 = $$v_template('<span> </span>');

const $$v_n16 = $$v_template('<button id="construct">');

const $$v_n18 = $$v_template('<span>construct</span>');

const $$v_n21 = $$v_template('<span> </span>');

const $$v_n24 = $$v_template('<button id="counter-increase">');

const $$v_n26 = $$v_template('<span>counter increase</span>');

const $$v_n29 = $$v_template('<span> </span>');

const $$v_n32 = $$v_template('<button id="replace">');

const $$v_n34 = $$v_template('<span>replace</span>');

const $$v_n37 = $$v_template('<span> </span>');

const $$v_n42 = $$v_template('<span> </span>');

const $$v_n45 = $$v_template('<p>');

const $$v_n47 = $$v_template(' ');

const $$v_n49 = $$v_template('<span> </span>');

const $$v_n52 = $$v_template('<p>');

const $$v_n54 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const child = $$ref();
	const enabled = $$ref(true);
	const observed = $$ref(0);
	const counter = $$shallowRef();
	class ReplacementCounter {
		value = 10;
		increment() {
			this.value += 10;
		}
	}
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => {
		child.value?.increase();
		observed.value = child.value?.current() ?? -1;
	});
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	$$v_on($$v_n9, 'click', () => enabled.value = !enabled.value);
	const $$v_n14 = $$v_n13();
	const $$v_n15 = $$v_n14.firstChild;
	const $$v_n17 = $$v_n16();
	const $$v_n19 = $$v_n18();
	const $$v_n20 = $$v_n19.firstChild;
	$$v_insert([$$v_n20], $$v_n17);
	$$v_on($$v_n17, 'click', () => counter.value = new child.value.Counter());
	const $$v_n22 = $$v_n21();
	const $$v_n23 = $$v_n22.firstChild;
	const $$v_n25 = $$v_n24();
	const $$v_n27 = $$v_n26();
	const $$v_n28 = $$v_n27.firstChild;
	$$v_insert([$$v_n28], $$v_n25);
	$$v_on($$v_n25, 'click', () => {
		counter.value.increment();
		counter.value = counter.value;
	});
	const $$v_n30 = $$v_n29();
	const $$v_n31 = $$v_n30.firstChild;
	const $$v_n33 = $$v_n32();
	const $$v_n35 = $$v_n34();
	const $$v_n36 = $$v_n35.firstChild;
	$$v_insert([$$v_n36], $$v_n33);
	$$v_on($$v_n33, 'click', () => {
		child.value.Counter = ReplacementCounter;
		child.value.increase = () => observed.value = 99;
	});
	const $$v_n38 = $$v_n37();
	const $$v_n39 = $$v_n38.firstChild;
	const $$v_n41 = $$v_createIf(() => enabled.value, () => {
		const $$v_n40 = $$v_createDynamicComponent(() => $$v_unref(Child), { $: [() => $$component_props({ 'initial': 2 })] });
		$$v_setTemplateRefBinding($$v_n40, () => ($$component) => child.value = $$component);
		return $$v_n40;
	});
	const $$v_n43 = $$v_n42();
	const $$v_n44 = $$v_n43.firstChild;
	const $$v_n46 = $$v_n45();
	const $$v_n48 = $$v_n47();
	$$v_insert([$$v_n48], $$v_n46);
	const $$v_n50 = $$v_n49();
	const $$v_n51 = $$v_n50.firstChild;
	const $$v_n53 = $$v_n52();
	const $$v_n55 = $$v_n54();
	$$v_insert([$$v_n55], $$v_n53);
	$$v_renderEffect(() => {
		$$v_setText($$v_n48, `${child.value?.version ?? 'none' ?? ''}:${child.value?.token ?? 'none' ?? ''}:${child.value?.object.count ?? 0 ?? ''}:${observed.value ?? ''}`);
		$$v_setText($$v_n55, `${counter.value?.value ?? 0 ?? ''}`);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n15, $$v_n17, $$v_n23, $$v_n25, $$v_n31, $$v_n33, $$v_n39, $$v_n41, $$v_n44, $$v_n46, $$v_n51, $$v_n53];
} });
