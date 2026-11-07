import * as $ from 'svelte/internal/server';
import Select, { Option } from '@smui/select';

export default function _Keys($$renderer) {
	let fruits = [
		{ id: 1, label: 'Apple', price: 35 },
		{ id: 2, label: 'Orange', price: 38 },
		{ id: 3, label: 'Banana', price: 28 },
		{ id: 4, label: 'Mango', price: 25 }
	];

	let valueA = void 0;
	let valueB = true;
	let valueC = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		Select($$renderer, {
			key: (fruit) => `${fruit ? fruit.id : ''}`,
			label: 'Objects',
			get value() {
				return valueA;
			},

			set value($$value) {
				valueA = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Option($$renderer, { value: undefined });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(fruits);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let fruit = each_array[$$index];

					Option($$renderer, {
						value: fruit,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(fruit.label)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueA ? valueA.label : 'None')}, Price: ${$.escape(valueA ? valueA.price : '-')}¢</pre></div> <div>`);

		Select($$renderer, {
			key: (bool) => `${bool}`,
			label: 'Booleans',
			get value() {
				return valueB;
			},

			set value($$value) {
				valueB = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like([true, false]);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let value = each_array_1[$$index_1];

					Option($$renderer, {
						value,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(value ? 'Yes' : 'No')}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(JSON.stringify(valueB))}</pre></div> <div>`);

		Select($$renderer, {
			key: (value) => `${value == null ? '' : value}`,
			label: 'Integers',
			get value() {
				return valueC;
			},

			set value($$value) {
				valueC = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Option($$renderer, { value: null });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array_2 = $.ensure_array_like([0, 1, 2, 3, 4]);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let value = each_array_2[$$index_2];

					Option($$renderer, {
						value,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(value)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(JSON.stringify(valueC))}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}