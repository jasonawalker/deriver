function derive(t) {
    // TODO: Figure out better way to determine which rule to use
    if(t.indexOf("^") > -1) {
        return powerRule(t);
    } else {
        return constantRule(t);
    }

}


function constantRule(t) {
    var schema, res;

    var fns = [
        function() {
            schema = new Tree(TreePattern.NUM);
            res = 0;
        },
        function() {
            schema = new Tree("*");
            schema.l(TreePattern.NUM);
            schema.r("x");
            res = t.left.val;
        },
        function() {
            schema = new Tree("*");
            schema.l("x");
            schema.r(TreePattern.NUM);
            res = t.right.val;
        },
        function() {
            schema = new Tree("x");
            res = 1;
        },
        function() {
            throw t.toFlatString() + " not a constant rule";
        }
    ];

    var i = 0;
    while(!t.equals(schema)) {
        fns[i]();
        i++;
    }

    return res;
}

/*
    basic: x^5
    coefficent: 3*x^5
    complex: 3*(10*x)^5
*/
function powerRule(t) {
    var tree = t.clone();

    var fns = {
        basic: function() {
            var _tree = new Tree("*");
            _tree.l(1);
            _tree.r(tree);
            tree = _tree;
            return this.coefficent();
        },
        coefficent: function() {
            var c = tree.right.right.val--;
            tree.left.val *= c;
            return tree;
        }
    };

    var basicSchema = new Tree("^");
    basicSchema.l(TreePattern.ANY);
    basicSchema.r(TreePattern.NUM);

    var coefficentSchema = new Tree("*");
    coefficentSchema.l(TreePattern.NUM);
    coefficentSchema.r(basicSchema);

    if(tree.equals(basicSchema)) return fns.basic();
    else if(tree.equals(coefficentSchema)) return fns.coefficent();
    else throw tree.toFlatString() + "Is not a power rule";

}
