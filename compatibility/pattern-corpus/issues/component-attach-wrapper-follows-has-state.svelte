<script>
	import Child from './Child.svelte';
	import { focus, make } from './lib.js';
	let i = $state(0);
	let count = $state(0);
	let debug = $state(false);
	let fns = [(el) => {}, (el) => {}];
	const local = (el) => {};
	let stateful = $state((el) => {});
	let flip = $state(true);
	function decl(el) {}
</script>

<Child {@attach (el) => el.focus()} />
<Child {@attach focus} />
<Child {@attach fns[i]} />
<Child {@attach flip ? (el) => {} : (el) => {}} />
<Child
	{@attach (el) => {
		el.textContent = String(count);
	}}
/>
<Child {@attach make(count)} />
<Child {@attach make()} />
<Child {@attach local} />
<Child {@attach stateful} />
<Child {@attach debug && ((el) => {})} />
<Child {@attach decl} />
<Child
	{@attach function (el) {
		count++;
	}}
/>
<Child {@attach flip ? local : decl} />
<Child {@attach (count = 1)} />
