use super::Visited;

#[test]
fn bits_stay_independent_across_words_and_growth() {
    let mut visited = Visited::new();
    for id in [0, 63, 64, 127, 128, 4095] {
        assert!(visited.insert(id), "first visit of {id}");
        assert!(!visited.insert(id), "second visit of {id}");
    }
    for id in [63, 64, 128] {
        visited.remove(id);
    }
    for id in [0, 127, 4095] {
        assert!(!visited.insert(id), "retained visit of {id}");
    }
    for id in [63, 64, 128] {
        assert!(visited.insert(id), "removed visit of {id}");
    }
}
