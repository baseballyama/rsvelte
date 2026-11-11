<script>
  let {
    a: { b },
    c: [d],
    e: { f = 5, ...g },
    h: [[i]],
  } = { a: { b: 1 }, c: [2], e: { f: 3, z: 4 }, h: [[5]] };

  function inc() {
    b++;
    d++;
    f++;
    i++;
  }
</script>

<button onclick={inc}>{b}{d}{f}{i}{Object.keys(g).length}</button>
