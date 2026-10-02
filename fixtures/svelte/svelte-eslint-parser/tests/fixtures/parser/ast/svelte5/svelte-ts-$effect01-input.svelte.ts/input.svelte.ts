let count = $state(0);
const doubled = $derived(count * 2);

export function increment() {
  count += 1;
}

$effect(() => {
  console.log({ count, doubled });

  return () => {
    console.log("cleanup");
  };
});
