fdescribe("Simplifier::", function() {
    var data = __simplifytestdata;

    it("Should Simplify", function() {
        for(var arr in data) {
            expect(simplify(parseInput(data[arr][0]))).toEqual(parseInput(data[arr][1]));
        }
    });
});
