import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let form_attributes = { id: 'initial-form' };
	let class_name = 'first';
	let background_color = 'rgb(255, 0, 0)';

	function update() {
		form_attributes = { id: 'updated-form' };
		class_name = 'second';
		background_color = 'rgb(0, 0, 255)';
	}

	$$renderer.push(`<button>update</button> <form${$.attributes({ ...form_attributes, class: $.clsx(class_name) }, void 0, void 0, { 'background-color': background_color })}><input${$.attributes({ ...{ name: '__className' }, value: 'x' }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...{ name: '__style' }, value: 'y' }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ ...{ name: '__attributes' }, value: 'z' }, void 0, void 0, void 0, 4)}/></form>`);
}