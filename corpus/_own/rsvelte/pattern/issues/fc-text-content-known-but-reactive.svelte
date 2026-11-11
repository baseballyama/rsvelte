<script>
	let { p } = $props();
	let s = $state(1);
	const fixed = 'k';
</script>

<!-- Known value, but the expression still reads reactive state: upstream gates
     the `textContent` shortcut on `has_state`, never on whether the value is
     known, so this element keeps its own text node. -->
<em>x{void p}</em>
<!-- Neither known nor reactive: the shortcut applies. -->
<i>y{fixed}</i>
<!-- Reactive and unknown: a template_effect. -->
<u>z{s}</u>
<button onclick={() => s++}>go</button>
