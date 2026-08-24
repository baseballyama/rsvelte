<script>
  let n = $state(0);
</script>

<button
  onclick={() => {
    label: for (let i = 0; i < 2; i++) {
      for (const j of [1, 2]) {
        if (j > 1) continue label;
        n += j;
      }
    }
  }}>a</button
>

<button
  onclick={() => {
    switch (n) {
      case 0:
      case 1: {
        n += 1;
        break;
      }
      default:
        n = 0;
    }
  }}>b</button
>

<button
  onclick={() => {
    do {
      n += 1;
    } while (n < 2);
  }}>c</button
>

<button
  onclick={() => {
    try {
      throw new Error("x");
    } catch {
      n = -1;
    } finally {
      n += 0;
    }
  }}>d</button
>

<b>{n}</b>
