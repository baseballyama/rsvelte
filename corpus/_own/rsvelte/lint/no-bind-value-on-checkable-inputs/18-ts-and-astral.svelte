<script lang="ts">
  let 値: string = '';
  const kind = 'checkbox' as const;
</script>

<div data-x="𝔘𝔫𝔦👨‍👩‍👧‍👦">👩‍🚀<input type={kind} bind:value={値} /></div>
<div data-y="😀😀"><input type="radio" bind:value={値 as string} /></div>
