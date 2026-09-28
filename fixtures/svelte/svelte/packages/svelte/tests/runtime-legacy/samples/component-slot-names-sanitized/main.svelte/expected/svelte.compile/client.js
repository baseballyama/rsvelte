import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<h1 slot="header1">Header 1</h1>`);
var root_1 = $.from_html(`<h2 slot="-header2_">Header 2</h2>`);
var root_2 = $.from_html(`<h3 slot="3header">Header 3</h3>`);
var root_3 = $.from_html(`<h4 slot="_header4">Header 4</h4>`);
var root_4 = $.from_html(`<h5 slot="header-5">Header 5</h5>`);
var root_5 = $.from_html(`<h5 slot="header&amp;5">Header 5b</h5>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			header1: ($$anchor, $$slotProps) => {
				var h1 = root();

				$.append($$anchor, h1);
			},

			'-header2_': ($$anchor, $$slotProps) => {
				var h2 = root_1();

				$.append($$anchor, h2);
			},

			'3header': ($$anchor, $$slotProps) => {
				var h3 = root_2();

				$.append($$anchor, h3);
			},

			_header4: ($$anchor, $$slotProps) => {
				var h4 = root_3();

				$.append($$anchor, h4);
			},

			'header-5': ($$anchor, $$slotProps) => {
				var h5 = root_4();

				$.append($$anchor, h5);
			},

			'header&5': ($$anchor, $$slotProps) => {
				var h5_1 = root_5();

				$.append($$anchor, h5_1);
			}
		}
	});
}