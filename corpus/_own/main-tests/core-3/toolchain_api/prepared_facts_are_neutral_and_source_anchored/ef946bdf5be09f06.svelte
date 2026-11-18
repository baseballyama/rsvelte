<script context="module">
const moduleValue = 1;
</script>
<script lang="ts">
let { value = $bindable(0) } = $props(); export { value as version };
</script>
<button>{value}</button>
<style>.button { color: red }</style>