<script>
          class Query {
            #promise = $state(null);
            get() { return this.#promise ??= run(); }
          }
          function run() { return Promise.resolve(1); }
        </script>
        <p>{new Query().get()}</p>