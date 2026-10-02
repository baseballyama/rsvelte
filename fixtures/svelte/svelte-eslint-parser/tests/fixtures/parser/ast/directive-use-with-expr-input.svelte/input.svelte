<script>
const foo = {
    bar: (node) => {
        node.textContent = 'Success'
    }
}
</script>
<div use:foo.bar />

<!-- https://svelte.dev/repl/c0a1754292044af695fc20ee66166f89?version=3.52.0 -->
