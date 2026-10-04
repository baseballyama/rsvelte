import { defineVaporComponent as $$v_defineVaporComponent, getCurrentInstance as $$v_getCurrentInstance, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, remove as $$v_remove, renderEffect as $$v_renderEffect, setAttr as $$v_setAttr, setText as $$v_setText, template as $$v_template, watchPostEffect as $$v_watchPostEffect } from 'vue';

import { customRef as $$createState } from 'vue';

const $$attr = (v) => v == null ? null : `${v}`;

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

const $$inject_styles = (instance, hash, code) => {
	let target = document.head;
	while (instance) {
		if (instance.ce?.shadowRoot) {
			target = instance.ce.shadowRoot;
			break;
		}
		instance = instance.parent;
	}
	if (target.querySelector('#' + hash)) return;
	const style = document.createElement('style');
	style.id = hash;
	style.textContent = code;
	target.appendChild(style);
};

const $$v_n0 = $$v_template('<meta name="injected">');

const $$v_n2 = $$v_template('<button>');

const $$v_n4 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const count = $$ref(0);
	$$inject_styles($$v_getCurrentInstance(), 'svelte-1hu005u', '\n  button.svelte-1hu005u { color: rgb(7, 8, 9); font-size: 23px; }\n');
	$$v_watchPostEffect(() => document.title = [`injected ${count.value ?? ''}`].join(''));
	const $$v_n1 = $$v_n0();
	$$v_insert([[], $$v_n1], document.head);
	$$v_onScopeDispose(() => $$v_remove([[], $$v_n1], document.head));
	const $$v_n3 = $$v_n2();
	const $$v_n5 = $$v_n4();
	$$v_insert([$$v_n5], $$v_n3);
	$$v_on($$v_n3, 'click', () => count.value++);
	const $$v_n6 = ($$el) => {
		if ($$el !== null) {
			$$set_class($$el, $$scoped_class('', 'svelte-1hu005u'), {});
		}
	};
	$$v_onScopeDispose(() => $$v_n6(null));
	$$v_renderEffect(() => {
		$$v_setAttr($$v_n1, 'content', $$attr(count.value));
		$$v_n6($$v_n3);
		$$v_setText($$v_n5, `count ${count.value ?? ''}`);
	});
	return [[], $$v_n3];
} });
