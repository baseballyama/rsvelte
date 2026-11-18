<script lang="ts">
const a = $derived((await fetch('/x')) satisfies Response);
</script>
<p>x</p>
