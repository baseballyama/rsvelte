<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	const subscribe = 'subscribe';
	const bag = { s };

	function run() {
		// paren-wrapped callee is still the MemberExpression
		(s.subscribe)();
		// nested member: the inner `s.subscribe` is not the callee
		s.subscribe.call(null, () => {});
		// deep member chain, property is still an Identifier
		bag.s.subscribe(() => {});
		// optional call: the CallExpression's parent is a ChainExpression
		s.subscribe?.(() => {});
		// bare identifier call — no MemberExpression at all
		subscribe;
		// sequence: the CallExpression's parent is a SequenceExpression
		s.subscribe(), s.subscribe();
	}
</script>

<button onclick={run}>go</button>
