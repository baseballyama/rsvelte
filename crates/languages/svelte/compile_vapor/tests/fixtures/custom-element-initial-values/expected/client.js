import { computed as $$v_computed, createComponent as $$v_createComponent, createVaporApp as $$v_createVaporApp, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, inject as $$v_inject, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, shallowReactive as $$v_shallowReactive, template as $$v_template, useHost as $$v_useHost } from 'vue';

import { customRef as $$createState, shallowRef as $$shallowRef, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, onMounted as $$onMounted, onScopeDispose as $$onScopeDispose, nextTick as $$nextTick } from 'vue';

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

const $$on_mount = (callback) => {
	let cleanup;
	const mount = () => {
		cleanup = $$untrack(callback);
	};
	const deferred = $$v_currentInstance?.__rsvelte_async_mount;
	if (deferred) deferred.push(mount); else $$onMounted(mount);
	$$onScopeDispose(() => {
		if (typeof cleanup === 'function') cleanup();
	});
};

const $$on_mount_server = () => {};

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>sample</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<button>');

const $$v_n10 = $$v_template('<span>increment</span>');

const $$v_n13 = $$v_template('<span> </span>');

const $$v_n16 = $$v_template('<button>');

const $$v_n18 = $$v_template('<span>move</span>');

const $$v_n21 = $$v_template('<span> </span>');

const $$v_n24 = $$v_template('<button>');

const $$v_n26 = $$v_template('<span>reconnect</span>');

const $$v_n29 = $$v_template('<span> </span>');

const $$v_n32 = $$v_template('<p>');

const $$v_n34 = $$v_template(' ');

const $$v_n38 = $$v_template('<span> </span>');

const $$v_n41 = $$v_template('<output>');

const $$v_n43 = $$v_template(' ');

const $$component = $$v_defineVaporComponent({ inheritAttrs: false, props: { count: { default: 2 }, enabled: { default: false }, object: {}, name: { default: 'default' } }, setup(__props) {
	const $$props = __props;
	const $$host_value = $$custom_element_host();
	const $$host = () => $$host_value;
	const count = $$prop_cell($$props, 'count', () => 2, false, false);
	const object = $$prop_cell($$props, 'object', () => ({ default: true }), false, false);
	const onMount = $$on_mount;
	const onDestroy = $$onScopeDispose;
	const mounts = $$ref(0);
	const sampled = $$ref('');
	onMount(() => mounts.value++);
	onDestroy(() => $$host()?.setAttribute('data-destroyed', 'yes'));
	function sample() {
		const host = $$host();
		sampled.value = JSON.stringify([host.count, typeof host.count, host.enabled, host.object, host.name, host.getAttribute('count'), host.getAttribute('enabled'), host.getAttribute('object'), host.getAttribute('name'), host.getAttribute('data-destroyed')]);
	}
	function move() {
		const host = $$host();
		const parent = host.parentNode;
		host.remove();
		parent.appendChild(host);
	}
	function reconnect() {
		const host = $$host();
		const parent = host.parentNode;
		host.remove();
		setTimeout(() => parent.appendChild(host), 0);
	}
	$$custom_element_bind({ 'count': { get: () => count.value, set: ($$prop_value) => count.value = $$prop_value }, 'enabled': { get: () => $$props.enabled }, 'object': { get: () => object.value, set: ($$prop_value) => object.value = $$prop_value }, 'name': { get: () => $$props.name } });
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', sample);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	$$v_on($$v_n9, 'click', () => count.value++);
	const $$v_n14 = $$v_n13();
	const $$v_n15 = $$v_n14.firstChild;
	const $$v_n17 = $$v_n16();
	const $$v_n19 = $$v_n18();
	const $$v_n20 = $$v_n19.firstChild;
	$$v_insert([$$v_n20], $$v_n17);
	$$v_on($$v_n17, 'click', move);
	const $$v_n22 = $$v_n21();
	const $$v_n23 = $$v_n22.firstChild;
	const $$v_n25 = $$v_n24();
	const $$v_n27 = $$v_n26();
	const $$v_n28 = $$v_n27.firstChild;
	$$v_insert([$$v_n28], $$v_n25);
	$$v_on($$v_n25, 'click', reconnect);
	const $$v_n30 = $$v_n29();
	const $$v_n31 = $$v_n30.firstChild;
	const $$v_n33 = $$v_n32();
	const $$v_n35 = $$v_n34();
	const $$v_n36 = $$v_computed(() => JSON.stringify(object.value));
	const $$v_n37 = $$v_computed(() => String($$props.enabled));
	$$v_insert([$$v_n35], $$v_n33);
	const $$v_n39 = $$v_n38();
	const $$v_n40 = $$v_n39.firstChild;
	const $$v_n42 = $$v_n41();
	const $$v_n44 = $$v_n43();
	$$v_insert([$$v_n44], $$v_n42);
	$$v_renderEffect(() => {
		$$v_n37.value;
		$$v_n36.value;
		$$v_setText($$v_n35, `${count.value ?? ''}:${$$v_n37.value}:${$$props.name ?? ''}:${$$v_n36.value ?? ''}:${mounts.value ?? ''}`);
		$$v_setText($$v_n44, `${sampled.value ?? ''}`);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n15, $$v_n17, $$v_n23, $$v_n25, $$v_n31, $$v_n33, $$v_n40, $$v_n42];
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

$$component.element = $$custom_element($$component, { props: { 'count': { type: 'Number', reflect: true }, 'enabled': { type: 'Boolean', reflect: true }, 'object': { type: 'Object', reflect: true }, 'name': { type: 'String' } } });

customElements.define('vapor-initial-values', $$component.element);

export default $$component;
