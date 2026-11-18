<script>
            let obj = { a: 1, b: 2 };
            function g() {
                let out = "";
                for (let k in obj) { out += k; }
                return out;
            }
        </script>{g()}