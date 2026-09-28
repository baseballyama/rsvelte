import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function greet(greeting) {
			(void 0).dispatchEvent(new CustomEvent('greeting', { detail: greeting }));
		}

		function welcome() {
			(void 0).dispatchEvent(new CustomEvent('greeting', { detail: 'welcome' }));
		}

		function bonjour() {
			const element = void 0;

			element.dispatchEvent(new CustomEvent('greeting', { detail: 'bonjour' }));
		}

		$$renderer.push(`<button>say hello</button> <button>say welcome</button> <button>say bonjour</button>`);
	});
}