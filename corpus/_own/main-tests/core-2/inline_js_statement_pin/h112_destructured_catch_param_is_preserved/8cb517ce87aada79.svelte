<script>
            let s = "";
            function k() {
                try { throw new Error("x"); }
                catch ({ message }) { s = message; }
                return s;
            }
        </script>{k()}