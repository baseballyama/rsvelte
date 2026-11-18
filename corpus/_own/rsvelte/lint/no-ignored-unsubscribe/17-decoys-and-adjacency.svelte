<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	const text = 's.subscribe()';
	const re = /\.subscribe\(\)/;
	// s.subscribe(); in a line comment
	/* s.subscribe(); in a block comment */

	function go() {
		/* s.subscribe(); */ s.subscribe();
		s . subscribe ( ) ;
		const keep = s.subscribe();
		return [keep, text, re];
	}
</script>

<!-- s.subscribe() in an HTML comment -->
<button onclick={go} data-x="s.subscribe()">{text}</button>
