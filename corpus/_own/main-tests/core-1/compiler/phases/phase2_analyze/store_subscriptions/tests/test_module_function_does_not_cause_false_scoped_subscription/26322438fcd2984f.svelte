<script context="module">
    export function f() {}
</script>
<script>
    import { opts } from './store';
</script>
<button on:click={() => ($opts = false)}>x</button>
