<script lang="ts">
const a = $derived((await fetch('/x')) as Response);
</script>
<p>x</p>
