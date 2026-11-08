use super::*;

static PAIR: TextContract = TextContract {
    identifier: "test.pair",
    version: 1,
    arguments: &["left", "right"],
};

#[test]
fn a_call_with_the_contract_s_arguments_reaches_the_backend() {
    let function = TextFunction::new(&PAIR, |arguments| Ok(arguments.concat()));
    assert_eq!(function.call(&["a", "b"]), Ok("ab".to_owned()));
}

#[test]
fn a_call_with_other_arguments_never_reaches_the_backend() {
    let function = TextFunction::new(&PAIR, |_| panic!("reached the backend"));
    let error = function.call(&["a", "b", "c"]).expect_err("too many");
    assert_eq!(error.0, "`test.pair` takes 2 arguments, not 3");
    function.call(&["a"]).expect_err("too few");
}

#[test]
fn no_functions_names_the_contract() {
    let reference = FunctionReference::Runtime {
        handle: "h".to_owned(),
    };
    let error = NoFunctions.resolve(&reference, &PAIR).expect_err("none");
    assert!(error.0.starts_with("`test.pair` "), "{}", error.0);
}

#[test]
fn a_reference_names_its_backend() {
    let reference: FunctionReference =
        serde_json::from_str(r#"{"backend":"native","library":"l.so","symbol":"s"}"#)
            .expect("decodes");
    assert!(matches!(reference, FunctionReference::Native { .. }));
    let unknown =
        serde_json::from_str::<FunctionReference>(r#"{"backend":"runtime","handle":"h","x":1}"#);
    unknown.expect_err("unknown field");
}

struct Length;

impl Contract for Length {
    type Input<'a> = &'a str;
    type Output = usize;

    const IDENTIFIER: &'static str = "example.length";
    const VERSION: u32 = 1;
}

#[test]
fn typed_functions_accept_borrowed_inputs_and_keep_their_owners_alive() {
    let owner = Arc::new(7);
    let weak = Arc::downgrade(&owner);
    let function = Function::<Length>::new(move |input| Ok(input.len() + *owner));
    let cloned = function.clone();
    drop(function);
    let input = String::from("abc");
    assert_eq!(cloned.call(&input).expect("function result"), 10);
    std::thread::scope(|scope| {
        scope.spawn(|| assert_eq!(cloned.call(&input).expect("thread result"), 10));
    });
    assert!(weak.upgrade().is_some());
    drop(cloned);
    assert!(weak.upgrade().is_none());
}

#[test]
fn function_errors_are_preserved() {
    let function = Function::<Length>::new(|_| Err(CallError("callback failed".into())));
    assert_eq!(
        function.call("input"),
        Err(CallError("callback failed".into()))
    );
}
