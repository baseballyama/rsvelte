import { computed as $$v_computed, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, shallowRef as $$shallowRef } from 'vue';

const $$destructure_array = (value, count = Infinity) => {
	if (Array.isArray(value)) return value;
	const result = [];
	if (count === 0) return result;
	for (const item of value) {
		result.push(item);
		if (result.length === count) break;
	}
	return result;
};

const $$destructure_rest = (value, excluded) => {
	if (value == null) throw new TypeError('Cannot destructure null or undefined');
	const keys = new Set(excluded.map((key) => typeof key === 'symbol' ? key : String(key)));
	const result = {};
	for (const key in value) {
		if (!keys.has(key)) result[key] = value[key];
	}
	Object.getOwnPropertySymbols(value).forEach((key) => {
		if (!keys.has(key) && Object.propertyIsEnumerable.call(value, key)) result[key] = value[key];
	});
	return result;
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

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>deep</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<button>');

const $$v_n10 = $$v_template('<span>raw</span>');

const $$v_n13 = $$v_template('<span> </span>');

const $$v_n16 = $$v_template('<p>');

const $$v_n18 = $$v_template(' ');

const $$v_n22 = $$v_template('<span> </span>');

const $$v_n25 = $$v_template('<output>');

const $$v_n27 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const $$pattern_base_23 = $$ref({ deep: {}, list: [undefined, 4, 5], unused: 6 }), $$pattern_23 = $$ref($$pattern_base_23.value), $$pattern_3 = $$ref((($$pattern_default) => $$pattern_default === undefined ? 1 : $$pattern_default)($$pattern_23.value['n'])), n = $$ref($$pattern_3.value), $$pattern_11 = $$ref($$pattern_23.value['deep']), $$pattern_9 = $$ref((($$pattern_default) => $$pattern_default === undefined ? 2 : $$pattern_default)($$pattern_11.value['value'])), value = $$ref($$pattern_9.value), $$pattern_19 = $$ref($$destructure_array($$pattern_23.value['list'])), $$pattern_16 = $$ref((($$pattern_default) => $$pattern_default === undefined ? 3 : $$pattern_default)($$pattern_19.value[0])), first = $$ref($$pattern_16.value), remaining = $$ref($$pattern_19.value.slice(1)), rest = $$ref($$destructure_rest($$pattern_23.value, ['n', 'deep', 'list']));
	const $$pattern_base_45 = $$shallowRef([10, 20, 30]), $$pattern_45 = $$shallowRef($$destructure_array($$pattern_base_45.value)), a = $$shallowRef($$pattern_45.value[0]), tail = $$shallowRef($$pattern_45.value.slice(2));
	const $$pattern_base_62 = $$ref({}), $$pattern_62 = $$ref($$pattern_base_62.value), $$pattern_60 = $$ref((($$pattern_default) => $$pattern_default === undefined ? () => n.value : $$pattern_default)($$pattern_62.value['read'])), read = $$ref($$pattern_60.value);
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => {
		n.value++;
		value.value++;
		remaining.value.push(6);
	});
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	$$v_on($$v_n9, 'click', () => {
		a.value++;
		tail.value = [...tail.value, 40];
	});
	const $$v_n14 = $$v_n13();
	const $$v_n15 = $$v_n14.firstChild;
	const $$v_n17 = $$v_n16();
	const $$v_n19 = $$v_n18();
	const $$v_n20 = $$v_computed(() => JSON.stringify(rest.value));
	const $$v_n21 = $$v_computed(() => remaining.value.join(','));
	$$v_insert([$$v_n19], $$v_n17);
	const $$v_n23 = $$v_n22();
	const $$v_n24 = $$v_n23.firstChild;
	const $$v_n26 = $$v_n25();
	const $$v_n28 = $$v_n27();
	const $$v_n29 = $$v_computed(() => read.value());
	const $$v_n30 = $$v_computed(() => tail.value.join(','));
	$$v_insert([$$v_n28], $$v_n26);
	$$v_renderEffect(() => {
		$$v_n21.value;
		$$v_n20.value;
		$$v_n30.value;
		$$v_n29.value;
		$$v_setText($$v_n19, `${n.value ?? ''}:${value.value ?? ''}:${first.value ?? ''}:${$$v_n21.value ?? ''}:${$$v_n20.value ?? ''}`);
		$$v_setText($$v_n28, `${a.value ?? ''}:${$$v_n30.value ?? ''}:${$$v_n29.value ?? ''}`);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n15, $$v_n17, $$v_n24, $$v_n26];
} });
