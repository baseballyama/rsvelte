<script>
  let outer = $state(1);

  function readFromFunction() {
    return outer;
  }

  const readFromArrow = () => outer;

  const readFromObject = {
    get value() {
      return outer;
    },
  };

  class ReadsIt {
    read() {
      return outer;
    }
  }

  function readFromLoop() {
    let total = 0;
    for (let i = 0; i < 2; i++) total += outer;
    return total;
  }

  function readFromCatch() {
    try {
      throw new Error("x");
    } catch {
      return outer;
    }
  }

  const instance = new ReadsIt();
</script>

<button onclick={() => (outer += 1)}>x</button>
<b>{readFromFunction()}{readFromArrow()}</b>
<b>{readFromObject.value}{instance.read()}</b>
<b>{readFromLoop()}{readFromCatch()}</b>
