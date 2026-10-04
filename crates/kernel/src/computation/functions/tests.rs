use super::*;

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
