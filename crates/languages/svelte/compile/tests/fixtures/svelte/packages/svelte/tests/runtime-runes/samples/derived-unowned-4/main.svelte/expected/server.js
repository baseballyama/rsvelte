import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let thing = void 0;

	function update() {
		let data = { name: 1, position: 1 };
		let position = $.derived(() => data.position);
		let name = $.derived(() => data.name);

		thing = {
			get data() {
				return data;
			},

			get position() {
				return position();
			},

			get name() {
				return name();
			}
		};

		thing.position;
		data = { name: 2, position: 2 };
	}

	$$renderer.push(`<button>update</button> <div>${$.escape(thing?.data?.name)}</div> <div>${$.escape(thing?.name)}</div> <div>${$.escape(thing?.data?.position)}</div> <div>${$.escape(thing?.position)}</div>`);
}