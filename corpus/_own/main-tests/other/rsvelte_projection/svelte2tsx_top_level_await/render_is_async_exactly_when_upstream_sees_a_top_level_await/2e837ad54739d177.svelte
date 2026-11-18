<script lang="ts">
const a = $derived((await fetch('/x'))?.status);
</script>
<p>x</p>
