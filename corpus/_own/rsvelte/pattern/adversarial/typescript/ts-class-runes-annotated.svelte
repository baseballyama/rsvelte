<script lang="ts">
  class Store<T> {
    value: T = $state(undefined as T);
    readonly created: number = Date.now();
    #hidden: number = $state(0);
    derivedLen: number = $derived(String(this.value).length);

    constructor(initial: T) {
      this.value = initial;
    }

    get hidden(): number {
      return this.#hidden;
    }

    set hidden(next: number) {
      this.#hidden = next;
    }
  }

  const store = new Store<string>("abc");
</script>

<b>{store.value}{store.derivedLen}{store.hidden}</b>
