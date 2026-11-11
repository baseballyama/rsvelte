const $$ce_host_key = Symbol();
const $$custom_element_host = () =>
	$$v_inject($$ce_host_key, null) ?? $$v_useHost();
const $$custom_element_bind = (bindings) => {
	const host = $$v_inject($$ce_host_key, null);
	if (!host) return;
	host.$$bindings = bindings;
	$$v_renderEffect(() => host.$$reflect());
};
const $$custom_element_exports = (exports) => {
	const host = $$v_inject($$ce_host_key, null);
	if (!host) return;
	Object.keys(exports).forEach((name) =>
		Object.defineProperty(host, name, {
			configurable: true,
			get: () => (host.$$app ? exports[name] : undefined),
		}),
	);
};
const $$custom_element_value = (value, type, direction) => {
	if (type === 'Boolean' && typeof value !== 'boolean') value = value != null;
	if (direction === 'attribute') {
		if (type === 'Boolean') return value ? '' : null;
		if (type === 'Array' || type === 'Object')
			return value == null ? null : JSON.stringify(value);
	} else if (direction === 'prop') {
		if (type === 'Number') return value == null ? value : +value;
		if (type === 'Array' || type === 'Object')
			return value && JSON.parse(value);
	}
	return value;
};
const $$custom_element = (component, options) => {
	const definitions = Object.fromEntries(
		Object.keys(component.props ?? {})
			.filter((key) => key !== '__rsvelte_bindings')
			.map((key) => [key, {}]),
	);
	Object.assign(definitions, options.props ?? {});
	const names = Object.keys(definitions);
	const attributes = new Map(
		names.map((name) => [
			(definitions[name].attribute || name).toLowerCase(),
			name,
		]),
	);
	let Element = class extends HTMLElement {
		constructor() {
			super();
			this.$$data = {};
			this.$$bindings = null;
			this.$$app = null;
			this.$$connected = false;
			this.$$reflecting = false;
			this.$$container =
				options.shadow === false
					? this
					: this.attachShadow(options.shadow ?? { mode: 'open' });
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
				if (!(name in this.$$data))
					this.$$data[name] = $$custom_element_value(
						attribute.value,
						definitions[name]?.type,
						'prop',
					);
			});
			this.$$props = $$v_shallowReactive({ ...this.$$data });
			const children = Array.from(this.$$container.childNodes);
			const root = $$v_defineVaporComponent({
				inheritAttrs: false,
				setup: () => {
					this.$$container.replaceChildren(...children);
					if (
						options.styles &&
						!this.$$container.querySelector('[data-rsvelte-style]')
					) {
						const style = document.createElement('style');
						style.setAttribute('data-rsvelte-style', '');
						style.textContent = options.styles;
						this.$$container.prepend(style);
					}
					return $$v_createComponent(component, { $: [() => this.$$props] });
				},
			});
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
					const value = this.$$bindings?.[name]
						? this.$$bindings[name].get()
						: this.$$props[name];
					this.$$data[name] = value;
					const attribute = (definition.attribute || name).toLowerCase();
					const text = $$custom_element_value(
						value,
						definition.type,
						'attribute',
					);
					if (text == null) this.removeAttribute(attribute);
					else this.setAttribute(attribute, text);
				});
			} finally {
				this.$$reflecting = false;
			}
		}
	};
	names.forEach((name) =>
		Object.defineProperty(Element.prototype, name, {
			get() {
				return this.$$bindings?.[name]
					? this.$$bindings[name].get()
					: this.$$data[name];
			},
			set(value) {
				value = $$custom_element_value(value, definitions[name].type);
				this.$$data[name] = value;
				if (this.$$props) this.$$props[name] = value;
				this.$$bindings?.[name]?.set?.(value);
			},
		}),
	);
	if (options.extend) Element = options.extend(Element);
	return Element;
};
