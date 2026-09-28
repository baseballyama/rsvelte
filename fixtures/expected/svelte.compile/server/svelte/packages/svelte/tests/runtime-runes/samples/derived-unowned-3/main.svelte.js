import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Model {
			data;

			constructor(data) {
				this.data = data;
			}

			#name = $.derived(() => this.data?.name);

			get name() {
				return this.#name();
			}

			set name($$value) {
				return this.#name($$value);
			}

			#source = $.derived(() => this.data?.source);

			get source() {
				return this.#source();
			}

			set source($$value) {
				return this.#source($$value);
			}

			toggle() {
				this.data.name = this.data.name === 'zeeba' ? 'neighba' : 'zeeba';
			}
		}

		let model = new Model({ name: 'zeeba', source: 'initial' });

		let setModel = (source) => {
			let next = new Model({ name: 'zeeba', source });

			model = next;
		};

		let needsSet = false;

		let setWithEffect = () => {
			needsSet = true;
		};

		let toggle = () => {
			model.toggle();
		};

		$$renderer.push(`<button>Activate</button> <button>Toggle</button> ${$.escape(model.name)}
${$.escape(model.data.name)}`);
	});
}