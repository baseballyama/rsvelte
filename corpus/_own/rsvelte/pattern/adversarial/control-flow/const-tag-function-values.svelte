<script>
  let rows = $state([{ id: 1 }]);
</script>

{#each rows as row (row.id)}
  {@const arrow = (value) => value + row.id}
  {@const block = (value) => {
    return value * row.id;
  }}
  {@const named = function scale(value) {
    return value - row.id;
  }}
  {@const generator = function* () {
    yield row.id;
  }}
  {@const table = {
    get doubled() {
      return row.id * 2;
    },
  }}
  {@const Klass = class {
    id = row.id;
  }}
  <b>{arrow(1)}{block(2)}{named(3)}</b>
  <b>{[...generator()].join("")}</b>
  <b>{table.doubled}{new Klass().id}</b>
{/each}
