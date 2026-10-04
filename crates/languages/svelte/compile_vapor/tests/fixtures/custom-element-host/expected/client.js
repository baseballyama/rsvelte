import { createComponent as $$v_createComponent, createVaporApp as $$v_createVaporApp, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, inject as $$v_inject, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, shallowReactive as $$v_shallowReactive, template as $$v_template, useHost as $$v_useHost } from 'vue';

import { customRef as $$createState, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, onMounted as $$onMounted, onScopeDispose as $$onScopeDispose, nextTick as $$nextTick } from 'vue';

const $$keys = (o, seen = [], out = []) => {
	if (o == null) return out;
	Object.getOwnPropertyNames(o).forEach((k) => {
		if (seen.indexOf(k) < 0) {
			seen.push(k);
			if (Object.prototype.propertyIsEnumerable.call(o, k)) out.push(k);
		}
	});
	return $$keys(Object.getPrototypeOf(o), seen, out);
};

const $$clsx = (mix) => {
	if (typeof mix === 'string' || typeof mix === 'number') return '' + mix;
	if (typeof mix !== 'object' || mix === null) return '';
	if (Array.isArray(mix)) {
		return Array.from({ length: mix.length }, (_, k) => mix[k]).filter((x) => x).map((x) => $$clsx(x)).filter((y) => y).join(' ');
	}
	return $$keys(mix).filter((k) => mix[k]).join(' ');
};

const $$sclsx = (v) => typeof v === 'object' ? $$clsx(v) : v ?? '';

const $$ws = [32, 9, 10, 13, 12, 160, 11, 65279].map((c) => String.fromCharCode(c));

const $$remove_class = (name, key, a) => {
	const at = name.indexOf(key, a);
	if (at < 0) return name;
	const b = at + key.length;
	if ((at === 0 || $$ws.includes(name[at - 1])) && (b === name.length || $$ws.includes(name[b]))) {
		const head = at === 0 ? '' : name.substring(0, at);
		return $$remove_class(head + name.substring(b + 1), key, at);
	}
	return $$remove_class(name, key, b);
};

const $$to_class = (value, directives) => {
	let name = value == null ? '' : '' + value;
	if (directives) {
		Object.keys(directives).forEach((key) => {
			if (directives[key]) name = name ? name + ' ' + key : key; else if (name.length) name = $$remove_class(name, key, 0);
		});
	}
	return name === '' ? null : name;
};

const $$set_class = (el, value, next) => {
	const prev = el.$$class;
	if (prev !== value || prev === undefined) {
		const name = $$to_class(value, next);
		if (name == null) el.removeAttribute('class'); else el.setAttribute('class', name);
		el.$$class = value;
	} else if (el.$$classes !== next) {
		const before = el.$$classes;
		Object.keys(next).forEach((key) => {
			const present = !!next[key];
			if (before == null || present !== !!before[key]) {
				el.classList.toggle(key, present);
			}
		});
	}
	el.$$classes = next;
};

const $$scoped_class = (value, hash) => {
	const name = $$sclsx(value);
	return name == null || name === '' ? hash : name + ' ' + hash;
};

const $$scoped_spread = (value, hash) => ({ ...value, class: $$scoped_class(value.class, hash) });

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

const $$v_n0 = $$v_template('<p>');

const $$v_n2 = $$v_template(' ');

const $$v_n4 = $$v_template('<span> </span>');

const $$v_n7 = $$v_template('<button>');

const $$v_n9 = $$v_template('<span>increment</span>');

const $$component = $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const $$host_value = $$custom_element_host();
	const $$host = () => $$host_value;
	const onMount = $$on_mount;
	const count = $$ref(0);
	const events = $$ref(0);
	onMount(() => {
		const host = $$host();
		const update = () => events.value++;
		host.addEventListener('increment', update);
		return () => host.removeEventListener('increment', update);
	});
	function increment() {
		count.value++;
		$$host().dispatchEvent(new CustomEvent('increment', { detail: count.value }));
	}
	$$custom_element_bind({});
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	$$v_insert([$$v_n3], $$v_n1);
	const $$v_n5 = $$v_n4();
	const $$v_n6 = $$v_n5.firstChild;
	const $$v_n8 = $$v_n7();
	const $$v_n10 = $$v_n9();
	const $$v_n11 = $$v_n10.firstChild;
	$$v_insert([$$v_n11], $$v_n8);
	$$v_on($$v_n8, 'click', increment);
	const $$v_n12 = ($$el) => {
		if ($$el !== null) {
			$$set_class($$el, $$scoped_class('', 'svelte-10bgdrt'), {});
		}
	};
	$$v_onScopeDispose(() => $$v_n12(null));
	$$v_renderEffect(() => {
		$$v_setText($$v_n3, `${count.value ?? ''}/${events.value ?? ''}`);
		$$v_n12($$v_n8);
	});
	return [$$v_n1, $$v_n6, $$v_n8];
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

$$component.element = $$custom_element($$component, { styles: '\n  button.svelte-10bgdrt { color: rgb(1, 2, 3); font-size: 19px; }\n' });

customElements.define('rsvelte-counter', $$component.element);

export default $$component;
