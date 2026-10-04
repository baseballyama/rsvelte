import { defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState } from 'vue';

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

const $$v_n0 = $$v_template('<p data-sample class=" a  b \n c " style=" color: red;  background: blue ">');

const $$v_n2 = $$v_template('<span>static</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p data-sample>');

const $$v_n10 = $$v_template('<span>directives</span>');

const $$v_n14 = $$v_template('<span> </span>');

const $$v_n17 = $$v_template('<p data-sample style="">');

const $$v_n19 = $$v_template('<span>empty</span>');

const $$v_n22 = $$v_template('<span> </span>');

const $$v_n25 = $$v_template('<p data-sample>');

const $$v_n27 = $$v_template('<span>longhand</span>');

const $$v_n31 = $$v_template('<span> </span>');

const $$v_n34 = $$v_template('<p data-sample>');

const $$v_n36 = $$v_template('<span>shorthand</span>');

const $$v_n40 = $$v_template('<span> </span>');

const $$v_n43 = $$v_template('<button>');

const $$v_n45 = $$v_template('<span>sample</span>');

const $$v_n48 = $$v_template('<span> </span>');

const $$v_n51 = $$v_template('<button>');

const $$v_n53 = $$v_template('<span>toggle</span>');

const $$v_n56 = $$v_template('<span> </span>');

const $$v_n59 = $$v_template('<output>');

const $$v_n61 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const enabled = $$ref(false);
	const observed = $$ref('');
	function sample() {
		observed.value = JSON.stringify(Array.from(document.querySelectorAll('[data-sample]'), (element) => ['class', 'style'].map((name) => {
			const value = element.getAttribute(name);
			return value === null ? null : encodeURIComponent(value);
		})));
	}
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	const $$v_n13 = ($$el) => {
		if ($$el !== null) {
			$$styles($$el, ' color: red;  background: blue ', { 'color': [enabled.value ? 'green' : 'red', false] });
			$$set_class($$el, ' a  b \n c ', { 'b': enabled.value });
		}
	};
	$$v_onScopeDispose(() => $$v_n13(null));
	const $$v_n15 = $$v_n14();
	const $$v_n16 = $$v_n15.firstChild;
	const $$v_n18 = $$v_n17();
	const $$v_n20 = $$v_n19();
	const $$v_n21 = $$v_n20.firstChild;
	$$v_insert([$$v_n21], $$v_n18);
	const $$v_n23 = $$v_n22();
	const $$v_n24 = $$v_n23.firstChild;
	const $$v_n26 = $$v_n25();
	const $$v_n28 = $$v_n27();
	const $$v_n29 = $$v_n28.firstChild;
	$$v_insert([$$v_n29], $$v_n26);
	const $$v_n30 = ($$el) => {
		if ($$el !== null) {
			$$styles($$el, 'margin: 2px; color: red;', { 'margin-left': [enabled.value ? '3px' : '4px', false] });
		}
	};
	$$v_onScopeDispose(() => $$v_n30(null));
	const $$v_n32 = $$v_n31();
	const $$v_n33 = $$v_n32.firstChild;
	const $$v_n35 = $$v_n34();
	const $$v_n37 = $$v_n36();
	const $$v_n38 = $$v_n37.firstChild;
	$$v_insert([$$v_n38], $$v_n35);
	const $$v_n39 = ($$el) => {
		if ($$el !== null) {
			$$styles($$el, 'margin-left: 2px; color: red;', { 'margin': [enabled.value ? '3px' : '4px', false] });
		}
	};
	$$v_onScopeDispose(() => $$v_n39(null));
	const $$v_n41 = $$v_n40();
	const $$v_n42 = $$v_n41.firstChild;
	const $$v_n44 = $$v_n43();
	const $$v_n46 = $$v_n45();
	const $$v_n47 = $$v_n46.firstChild;
	$$v_insert([$$v_n47], $$v_n44);
	$$v_on($$v_n44, 'click', sample);
	const $$v_n49 = $$v_n48();
	const $$v_n50 = $$v_n49.firstChild;
	const $$v_n52 = $$v_n51();
	const $$v_n54 = $$v_n53();
	const $$v_n55 = $$v_n54.firstChild;
	$$v_insert([$$v_n55], $$v_n52);
	$$v_on($$v_n52, 'click', () => enabled.value = !enabled.value);
	const $$v_n57 = $$v_n56();
	const $$v_n58 = $$v_n57.firstChild;
	const $$v_n60 = $$v_n59();
	const $$v_n62 = $$v_n61();
	$$v_insert([$$v_n62], $$v_n60);
	$$v_renderEffect(() => {
		$$v_n13($$v_n9);
		$$v_n30($$v_n26);
		$$v_n39($$v_n35);
		$$v_setText($$v_n62, `${observed.value ?? ''}`);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n16, $$v_n18, $$v_n24, $$v_n26, $$v_n33, $$v_n35, $$v_n42, $$v_n44, $$v_n50, $$v_n52, $$v_n58, $$v_n60];
} });
