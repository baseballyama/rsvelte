import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = [];

	$$renderer.push(`<p>Checked: ${$.escape(foo)}</p> <hr/> <input type="checkbox"${$.attr('checked', foo.includes('a'), true)} value="a"/>a<br/> <input type="checkbox"${$.attr('checked', foo.includes('b'), true)} value="b"/>b<br/> <input type="checkbox"${$.attr('checked', foo.includes('c'), true)} value="c"/>c<br/> <input type="checkbox"${$.attr('checked', foo.includes('d'), true)} value="d"/>d<br/> <hr/> <input type="checkbox"${$.attr('checked', foo.includes('a'), true)} value="a"/>a<br/> <input type="checkbox"${$.attr('checked', foo.includes('b'), true)} value="b"/>b<br/> <input type="checkbox"${$.attr('checked', foo.includes('c'), true)} value="c"/>c<br/> <input type="checkbox"${$.attr('checked', foo.includes('d'), true)} value="d"/>d<br/>`);
}