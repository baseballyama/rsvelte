<script>
  let n = $state(1);
  let s = $state("a");
  let o = $state({ v: 1, list: [1] });

  function run() {
    n += 1;
    n -= 1;
    n *= 2;
    n /= 2;
    n %= 3;
    n **= 2;
    n <<= 1;
    n >>= 1;
    n >>>= 1;
    n &= 7;
    n |= 8;
    n ^= 1;
    n &&= 2;
    n ||= 3;
    n ??= 4;
    n++;
    n--;
    ++n;
    --n;
    s += "b";
    o.v += 1;
    o.list[0] += 1;
    o.list = [...o.list, 2];
    [n, o.v] = [o.v, n];
    ({ v: n } = o);
  }
</script>

<button onclick={run}>r</button>
<b>{n}{s}{o.v}{o.list.length}</b>
