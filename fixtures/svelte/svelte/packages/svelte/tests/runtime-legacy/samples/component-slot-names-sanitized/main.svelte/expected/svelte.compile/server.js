import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			header1: ($$renderer) => {
				$$renderer.push(`<h1 slot="header1">Header 1</h1>`);
			},

			'-header2_': ($$renderer) => {
				$$renderer.push(`<h2 slot="-header2_">Header 2</h2>`);
			},

			'3header': ($$renderer) => {
				$$renderer.push(`<h3 slot="3header">Header 3</h3>`);
			},

			_header4: ($$renderer) => {
				$$renderer.push(`<h4 slot="_header4">Header 4</h4>`);
			},

			'header-5': ($$renderer) => {
				$$renderer.push(`<h5 slot="header-5">Header 5</h5>`);
			},

			'header&5': ($$renderer) => {
				$$renderer.push(`<h5 slot="header&amp;5">Header 5b</h5>`);
			}
		}
	});
}