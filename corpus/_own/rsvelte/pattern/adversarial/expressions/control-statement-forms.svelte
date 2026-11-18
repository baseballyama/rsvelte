<script>
  let n = $state(0);

  function tour() {
    const out = [];

    outer: for (let i = 0; i < 3; i++) {
      inner: for (let j = 0; j < 3; j++) {
        if (j > 1) {
          continue outer;
        }

        if (i > 1) {
          break outer;
        }

        out.push(`${i}${j}`);
      }
    }

    let k = 0;

    do {
      out.push(`d${k}`);
      k += 1;
    } while (k < 2);

    while (k < 4) {
      out.push(`w${k}`);
      k += 1;
    }

    switch (out.length % 3) {
      case 0:
      case 1:
        out.push("low");
        break;

      case 2: {
        out.push("mid");
        break;
      }

      default:
        out.push("high");
    }

    try {
      out.push("try");
    } catch {
      out.push("catch");
    } finally {
      out.push("finally");
    }

    block: {
      out.push("block");
      break block;
    }

    return out.join(",");
  }
</script>

<b>{tour()}</b>
<button onclick={() => (n += 1)}>{n}</button>
