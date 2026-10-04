import { computed as $$v_computed, createFor as $$v_createFor, createIf as $$v_createIf, createKeyedFragment as $$v_createKeyedFragment, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, shallowRef as $$shallowRef, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

const $$each = (c) => c == null ? [] : Array.from(c);

const $$await_block = (getter, hasCatch) => {
	const state = $$shallowRef({ status: -1 });
	$$watchEffect((register) => {
		const value = getter();
		let active = true;
		register(() => {
			active = false;
		});
		if (value != null && typeof value.then === 'function') {
			let resolved = false;
			value.then((value) => {
				resolved = true;
				if (active) state.value = { status: 1, value };
			}, (error) => {
				resolved = true;
				if (!active) return;
				state.value = { status: 2, error };
				if (!hasCatch) throw error;
			});
			queueMicrotask(() => {
				if (active && !resolved) state.value = { status: 0 };
			});
		} else {
			state.value = { status: 1, value };
		}
	});
	return state;
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

const $$v_n4 = $$v_template('<aside>');

const $$v_n6 = $$v_template(' ');

const $$v_n12 = $$v_template('<footer>');

const $$v_n14 = $$v_template(' ');

const $$v_n16 = $$v_template('<button>');

const $$v_n18 = $$v_template('<span>change</span>');

const $$v_n21 = $$v_template('<span> </span>');

const $$v_n24 = $$v_template('<button>');

const $$v_n26 = $$v_template('<span>resolve</span>');

const $$v_n29 = $$v_template('<span> </span>');

const $$v_n38 = $$v_template('<p>');

const $$v_n40 = $$v_template(' ');

const $$v_n45 = $$v_template('<span> </span>');

const $$v_n48 = $$v_template('<i>');

const $$v_n50 = $$v_template('<span>pending</span>');

const $$v_n55 = $$v_template('<output>');

const $$v_n57 = $$v_template(' ');

const $$v_n61 = $$v_template('<span> </span>');

const $$v_n65 = $$v_template('<span> </span>');

const $$v_n69 = $$v_template('<span> </span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const items = $$ref([{ id: 1, user: { name: 'first' } }, { id: 2, user: { name: 'second' } }]);
	const fallback = $$ref('fallback');
	const promise = $$shallowRef(Promise.resolve({ text: 'ready', count: 2 }));
	function $$snippet_12($$v_n0 = { value: undefined }, $$v_n2 = { value: undefined }) {
		const $$v_n1 = $$v_computed(() => {
			const { user: { name } } = $$v_n0.value;
			return [name];
		});
		const name = $$v_computed(() => $$v_n1.value[0]);
		const $$v_n3 = $$v_computed(() => {
			const [position] = $$v_n2.value;
			return [position];
		});
		const position = $$v_computed(() => $$v_n3.value[0]);
		const $$v_n5 = $$v_n4();
		const $$v_n7 = $$v_n6();
		$$v_insert([$$v_n7], $$v_n5);
		$$v_renderEffect(() => {
			$$v_setText($$v_n7, `${name.value ?? ''}:${position.value ?? ''}`);
		});
		return [$$v_n5];
	}
	function $$snippet_15($$v_n8 = { value: undefined }, $$v_n10 = { value: undefined }) {
		const $$v_n9 = $$v_computed(() => {
			const value = $$v_n8.value === undefined ? fallback.value : $$v_n8.value;
			return [value];
		});
		const value = $$v_computed(() => $$v_n9.value[0]);
		const $$v_n11 = $$v_computed(() => {
			const { text = fallback.value } = $$v_n10.value === undefined ? {} : $$v_n10.value;
			return [text];
		});
		const text = $$v_computed(() => $$v_n11.value[0]);
		const $$v_n13 = $$v_n12();
		const $$v_n15 = $$v_n14();
		$$v_insert([$$v_n15], $$v_n13);
		$$v_renderEffect(() => {
			$$v_setText($$v_n15, `${value.value ?? ''}:${text.value ?? ''}`);
		});
		return [$$v_n13];
	}
	const $$v_n17 = $$v_n16();
	const $$v_n19 = $$v_n18();
	const $$v_n20 = $$v_n19.firstChild;
	$$v_insert([$$v_n20], $$v_n17);
	$$v_on($$v_n17, 'click', () => {
		items.value[0].user.name = 'changed';
		items.value.reverse();
	});
	const $$v_n22 = $$v_n21();
	const $$v_n23 = $$v_n22.firstChild;
	const $$v_n25 = $$v_n24();
	const $$v_n27 = $$v_n26();
	const $$v_n28 = $$v_n27.firstChild;
	$$v_insert([$$v_n28], $$v_n25);
	$$v_on($$v_n25, 'click', () => {
		fallback.value = "next";
		promise.value = Promise.resolve({ text: 'updated', count: 3 });
	});
	const $$v_n30 = $$v_n29();
	const $$v_n31 = $$v_n30.firstChild;
	const $$v_n44 = $$v_createFor(() => $$each(items.value), ($$v_n32, index) => {
		const $$v_n33 = $$v_computed(() => {
			const { id, user: { name } } = $$v_n32.value;
			return [id, name];
		});
		const id = $$v_computed(() => $$v_n33.value[0]);
		const name = $$v_computed(() => $$v_n33.value[1]);
		const $$v_n43 = $$v_createFor(() => [{ id: id.value }], ($$v_n34) => {
			const $$v_n35 = $$v_computed(() => {
				const { extra = fallback.value, ...rest } = $$v_n34.value;
				return [extra, rest];
			});
			const extra = $$v_computed(() => $$v_n35.value[0]);
			const rest = $$v_computed(() => $$v_n35.value[1]);
			const $$v_n42 = $$v_createFor(() => [[name.value.toUpperCase(), index.value + 1]], ($$v_n36) => {
				const $$v_n37 = $$v_computed(() => {
					const [label, position] = $$v_n36.value;
					return [label, position];
				});
				const label = $$v_computed(() => $$v_n37.value[0]);
				const position = $$v_computed(() => $$v_n37.value[1]);
				const $$v_n39 = $$v_n38();
				const $$v_n41 = $$v_n40();
				$$v_insert([$$v_n41], $$v_n39);
				$$v_renderEffect(() => {
					$$v_setText($$v_n41, `${id.value ?? ''}:${name.value ?? ''}:${label.value ?? ''}:${position.value ?? ''}:${extra.value ?? ''}:${rest.value.id ?? ''}`);
				});
				return [$$v_n39];
			});
			return [$$v_n42];
		});
		return [$$v_n43];
	}, ({ id, user: { name } }, index) => id);
	const $$v_n46 = $$v_n45();
	const $$v_n47 = $$v_n46.firstChild;
	const $$await_671 = $$await_block(() => promise.value, false);
	const $$v_n60 = $$v_createIf(() => $$await_671.value.status === 0, () => {
		const $$v_n49 = $$v_n48();
		const $$v_n51 = $$v_n50();
		const $$v_n52 = $$v_n51.firstChild;
		$$v_insert([$$v_n52], $$v_n49);
		return $$v_n49;
	}, () => $$v_createIf(() => $$await_671.value.status === 1, () => {
		const $$v_n59 = $$v_createFor(() => [$$await_671.value.value], ($$v_n53) => {
			const $$v_n54 = $$v_computed(() => {
				const { text, count } = $$v_n53.value;
				return [text, count];
			});
			const text = $$v_computed(() => $$v_n54.value[0]);
			const count = $$v_computed(() => $$v_n54.value[1]);
			const $$v_n56 = $$v_n55();
			const $$v_n58 = $$v_n57();
			$$v_insert([$$v_n58], $$v_n56);
			$$v_renderEffect(() => {
				$$v_setText($$v_n58, `${text.value ?? ''}:${count.value ?? ''}`);
			});
			return $$v_n56;
		});
		return $$v_n59;
	}, () => $$v_createIf(() => $$await_671.value.status === 2, () => {
		return [];
	})));
	const $$v_n62 = $$v_n61();
	const $$v_n63 = $$v_n62.firstChild;
	const $$v_n64 = $$v_createKeyedFragment(() => $$snippet_12, () => $$snippet_12 ? $$snippet_12($$v_computed(() => items.value[0]), $$v_computed(() => [items.value.length])) : []);
	const $$v_n66 = $$v_n65();
	const $$v_n67 = $$v_n66.firstChild;
	const $$v_n68 = $$v_createKeyedFragment(() => $$snippet_15, () => $$snippet_15 ? $$snippet_15() : []);
	const $$v_n70 = $$v_n69();
	const $$v_n71 = $$v_n70.firstChild;
	const $$v_n72 = $$v_createKeyedFragment(() => $$snippet_15, () => $$snippet_15 ? $$snippet_15($$v_computed(() => undefined), $$v_computed(() => ({ text: 'explicit' }))) : []);
	return [[], [], $$v_n17, $$v_n23, $$v_n25, $$v_n31, $$v_n44, $$v_n47, [$$v_n60], $$v_n63, $$v_n64, $$v_n67, $$v_n68, $$v_n71, $$v_n72];
} });
