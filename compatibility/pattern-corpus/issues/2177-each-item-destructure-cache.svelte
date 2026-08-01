<script>
  let list = [{ a: 1, b: 2 }];
  let pairs = [[1, 2]];
  let x, y;
</script>

{#each list as item}
  <button
    onclick={() => {
      ({ a: x, b: y } = item);
    }}>{item}</button
  >
{/each}
{#each pairs as pair}
  <button
    onclick={() => {
      [x, y] = pair;
    }}>{pair}</button
  >
{/each}
{x}
{y}
