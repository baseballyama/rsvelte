import { createComponent as $$v_createComponent, createIf as $$v_createIf, createVaporApp as $$v_createVaporApp, defineVaporComponent as $$v_defineVaporComponent, inject as $$v_inject, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, setAttr as $$v_setAttr, setText as $$v_setText, shallowReactive as $$v_shallowReactive, template as $$v_template, useHost as $$v_useHost } from 'vue';

import { customRef as $$createState } from 'vue';

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

const $$v_n0 = $$v_template('<slot>');

const $$v_n2 = $$v_template('<b>');

const $$v_n4 = $$v_template(' ');

const $$v_n7 = $$v_template('<span> </span>');

const $$v_n10 = $$v_template('<slot>');

const $$v_n12 = $$v_template('<i>');

const $$v_n14 = $$v_template(' ');

const $$v_n17 = $$v_template('<span> </span>');

const $$v_n20 = $$v_template('<button>');

const $$v_n22 = $$v_template('<span>change</span>');

const $$component = $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const count = $$ref(0);
	$$custom_element_bind({});
	const $$native_slots = Array.from($$custom_element_host().childNodes, ($$slot_node) => $$slot_node.slot || 'default');
	const $$v_n6 = $$v_createIf(() => $$native_slots.includes('named'), () => {
		const $$v_n1 = $$v_n0();
		$$v_setAttr($$v_n1, 'name', 'named');
		return $$v_n1;
	}, () => {
		const $$v_n3 = $$v_n2();
		const $$v_n5 = $$v_n4();
		$$v_insert([$$v_n5], $$v_n3);
		$$v_renderEffect(() => {
			$$v_setText($$v_n5, `named fallback ${count.value ?? ''}`);
		});
		return [$$v_n3];
	});
	const $$v_n8 = $$v_n7();
	const $$v_n9 = $$v_n8.firstChild;
	const $$v_n16 = $$v_createIf(() => $$native_slots.includes('default'), () => {
		const $$v_n11 = $$v_n10();
		return $$v_n11;
	}, () => {
		const $$v_n13 = $$v_n12();
		const $$v_n15 = $$v_n14();
		$$v_insert([$$v_n15], $$v_n13);
		$$v_renderEffect(() => {
			$$v_setText($$v_n15, `default fallback ${count.value ?? ''}`);
		});
		return [$$v_n13];
	});
	const $$v_n18 = $$v_n17();
	const $$v_n19 = $$v_n18.firstChild;
	const $$v_n21 = $$v_n20();
	const $$v_n23 = $$v_n22();
	const $$v_n24 = $$v_n23.firstChild;
	$$v_insert([$$v_n24], $$v_n21);
	$$v_on($$v_n21, 'click', () => count.value++);
	return [$$v_n6, $$v_n9, $$v_n16, $$v_n19, $$v_n21];
} });

const $$ce_host_key = Symbol();

const $$custom_element_host = () => $$v_inject($$ce_host_key, null) ?? $$v_useHost();

const $$custom_element_bind = (bindings) => {
	const host = $$v_inject($$ce_host_key, null);
	if (!host) return;
	host.$$bindings = bindings;
	$$v_renderEffect(() => host.$$reflect());
};

const $$custom_element_exports = (exports) => {
	const host = $$v_inject($$ce_host_key, null);
	if (!host) return;
	Object.keys(exports).forEach((name) => Object.defineProperty(host, name, { configurable: true, get: () => host.$$app ? exports[name] : undefined }));
};

const $$custom_element_value = (value, type, direction) => {
	if (type === 'Boolean' && typeof value !== 'boolean') value = value != null;
	if (direction === 'attribute') {
		if (type === 'Boolean') return value ? '' : null;
		if (type === 'Array' || type === 'Object') return value == null ? null : JSON.stringify(value);
	} else if (direction === 'prop') {
		if (type === 'Number') return value == null ? value : +value;
		if (type === 'Array' || type === 'Object') return value && JSON.parse(value);
	}
	return value;
};

const $$custom_element = (component, options) => {
	const definitions = Object.fromEntries(Object.keys(component.props ?? {}).filter((key) => key !== '__rsvelte_bindings').map((key) => [key, {}]));
	Object.assign(definitions, options.props ?? {});
	const names = Object.keys(definitions);
	const attributes = new Map(names.map((name) => [(definitions[name].attribute || name).toLowerCase(), name]));
	let Element = class extends HTMLElement {
		constructor() {
			super();
			this.$$data = {};
			this.$$bindings = null;
			this.$$app = null;
			this.$$connected = false;
			this.$$reflecting = false;
			this.$$container = options.shadow === false ? this : this.attachShadow(options.shadow ?? { mode: 'open' });
		}
		static get observedAttributes() {
			return Array.from(attributes.keys());
		}
		attributeChangedCallback(attribute, previous, value) {
			if (this.$$reflecting) return;
			const name = attributes.get(attribute);
			value = $$custom_element_value(value, definitions[name]?.type, 'prop');
			this.$$data[name] = value;
			if (this.$$props) this.$$props[name] = value;
		}
		async connectedCallback() {
			this.$$connected = true;
			await Promise.resolve();
			if (!this.$$connected || this.$$app) return;
			names.forEach((name) => {
				if (Object.prototype.hasOwnProperty.call(this, name)) {
					const value = this[name];
					delete this[name];
					this.$$data[name] = value;
				}
			});
			Array.from(this.attributes).forEach((attribute) => {
				const name = attributes.get(attribute.name) ?? attribute.name;
				if (!(name in this.$$data)) this.$$data[name] = $$custom_element_value(attribute.value, definitions[name]?.type, 'prop');
			});
			this.$$props = $$v_shallowReactive({ ...this.$$data });
			const children = Array.from(this.$$container.childNodes);
			const root = $$v_defineVaporComponent({ inheritAttrs: false, setup: () => {
				this.$$container.replaceChildren(...children);
				if (options.styles && !this.$$container.querySelector('[data-rsvelte-style]')) {
					const style = document.createElement('style');
					style.setAttribute('data-rsvelte-style', '');
					style.textContent = options.styles;
					this.$$container.prepend(style);
				}
				return $$v_createComponent(component, { $: [() => this.$$props] });
			} });
			this.$$app = $$v_createVaporApp(root);
			this.$$app.provide($$ce_host_key, this);
			this.$$app.mount(this.$$container);
			this.removeAttribute('data-v-app');
		}
		disconnectedCallback() {
			this.$$connected = false;
			Promise.resolve().then(() => {
				if (this.$$connected || !this.$$app) return;
				this.$$app.unmount();
				this.$$app = null;
				this.$$props = null;
				this.$$bindings = null;
			});
		}
		$$reflect() {
			this.$$reflecting = true;
			try {
				names.forEach((name) => {
					const definition = definitions[name];
					if (!definition.reflect) return;
					const value = this.$$bindings?.[name] ? this.$$bindings[name].get() : this.$$props[name];
					this.$$data[name] = value;
					const attribute = (definition.attribute || name).toLowerCase();
					const text = $$custom_element_value(value, definition.type, 'attribute');
					if (text == null) this.removeAttribute(attribute); else this.setAttribute(attribute, text);
				});
			} finally {
				this.$$reflecting = false;
			}
		}
	};
	names.forEach((name) => Object.defineProperty(Element.prototype, name, { get() {
		return this.$$bindings?.[name] ? this.$$bindings[name].get() : this.$$data[name];
	}, set(value) {
		value = $$custom_element_value(value, definitions[name].type);
		this.$$data[name] = value;
		if (this.$$props) this.$$props[name] = value;
		this.$$bindings?.[name]?.set?.(value);
	} }));
	if (options.extend) Element = options.extend(Element);
	return Element;
};

$$component.element = $$custom_element($$component, { shadow: false });

customElements.define('vapor-light-slots', $$component.element);

export default $$component;
