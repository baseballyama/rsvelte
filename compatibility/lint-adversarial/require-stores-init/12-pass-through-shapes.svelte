<script>
	import { writable, readable } from 'svelte/store';

	const cond = Math.random() > 0.5;
	const viaConditional = cond ? writable : readable;
	const viaLogical = writable || readable;
	const viaSequenceLast = (0, writable);
	const viaSequenceFirst = (writable, readable);

	const a = viaConditional();
	const b = viaLogical();
	const c = viaSequenceLast();
	const d = viaSequenceFirst();
</script>

<p>{a}{b}{c}{d}</p>
