import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let saySomething = (name) => {
			console.log('creating "Hello" handler for ' + name);

			return { handler: () => console.log('Hello ' + name) };
		};

		function change() {
			saySomething = (name) => {
				console.log('creating "Bye" handler for ' + name);

				return { handler: () => console.log('Bye ' + name) };
			};
		}

		$$renderer.push(`<button>Tama</button> <button>Pochi</button> <br/> <button>Change Function</button>`);
	});
}