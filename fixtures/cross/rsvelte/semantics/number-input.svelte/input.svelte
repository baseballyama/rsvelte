<script>
  // `v-model` on a number input: `parseFloat`, keeping the text when that is NaN (Vue's
  // looseToNumber), where `bind:value` gives a number or null. Vue also leaves the field alone
  // while it already holds the model's number, so "2.50" is not rewritten to "2.5".
  let n = $state(1);
  let input = $state();

  const looseToNumber = (text) => {
    const number = parseFloat(text);
    return isNaN(number) ? text : number;
  };
</script>

<input
  type="number"
  bind:this={input}
  value={input && looseToNumber(input.value) === n ? input.value : n}
  oninput={(e) => (n = looseToNumber(e.currentTarget.value))}
/>
<p>{typeof n}: {n} + 1 = {n + 1}</p>
