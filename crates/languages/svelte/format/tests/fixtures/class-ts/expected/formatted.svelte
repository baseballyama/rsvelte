<script lang="ts">
  let active = $state(false);
  let level: number = $state(1);
  let tone: string = $state("warm");
</script>

<div class={{ active, [tone]: level > 1 }} class:high={level > 2}>typed</div>
<div class:missing={active.length}>error</div>
<button onclick={() => level++}>{level}</button>
