<script lang="ts">
  let { label } = $props();
  function f(a, b) {
    return b;
  }
  const g = (x = 1) => 0;
  let c = 0;
  c = c + 1;
  let d: number = 1;
  function h() {
    h();
  }
  f;
  g;
</script>

<button type="">a</button>
<button type>a</button>
<button type="&#98;utton">a</button>
<button type="foo">a</button>
<button type={label}>a</button>
<button type="a{label}">a</button>
<button {type}>a</button>
