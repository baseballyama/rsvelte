<script context="module">
	function foo() {
		  return (node) => node.textContent = 'Success'
	}
</script>

<div use:foo() />
<!-- svelte compiler will warn, but it actually works. -->
<!-- Treats it as a compile error because svelte compiler will warn. -->

<!-- https://svelte.dev/repl/9204b41bcc0e4c088a0abd390b0e6ca4?version=3.52.0 -->
