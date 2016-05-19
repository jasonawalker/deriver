function derive(t) {
    if(t.val === 'x') return new Tree(1);

    if(!t.left && !t.right || TreePattern.eq(t.val, TreePattern.NUM)) return new Tree(0);

    // Sum and Difference Rule
    if(t.val === '+' || t.val === '-') {
        var res = new Tree(t.val);
        res.l(derive(t.left));
        res.r(derive(t.right));
        if(res.right.val === 0) return res.left;
        if(res.left.val === 0) return res.right;
        return res;
    }

    // Product Rule and Constant Rule
    if(t.val === '*') {
        if(!TreePattern.eq(t.right.val, TreePattern.NUM)) {
            if(!TreePattern.eq(t.left.val, TreePattern.NUM)) {
                return productRule(t);
            } else {
                return constantRule(t);
            }
        }
    }

    // Power Rule and Exponential Rule
    if(t.val === '^') {
        if(!TreePattern.eq(t.left.val, TreePattern.NUM)) {
            if(TreePattern.eq(t.left.val, TreePattern.NUM)) {
                return powerRule(t);
            }
        } else {
            if(!TreePattern.eq(t.right.val, TreePattern.NUM)) {
                return exponentialRule(t);
            }
        }
    }

    // Quotient Rule
    if(t.val === '/') {
        return quotientRule(t);
        //TODO make this check better and deal with fractions
    }

    // Log Rules
    if(TreePattern.eq(t.val, TreePattern.LOG)) {
        return logRule(t);
    }

    // Trig Rules
    if(TreePattern.eq(t.val, TreePattern.TRIG)) {
        return trigRules(t);
    }

}

var _schemas = {
    powerRule: {
        basic: '',
        coefficent: ''
    }
};

(function defineSchemas(){
    _schemas.powerRule.basic = new Tree("^");
    _schemas.powerRule.basic.l(TreePattern.ANY);
    _schemas.powerRule.basic.r(TreePattern.NUM);

    _schemas.powerRule.coefficent = new Tree("*");
    _schemas.powerRule.coefficent.l(TreePattern.NUM);
    _schemas.powerRule.coefficent.r(_schemas.powerRule.basic);
})();

function constantRule(t) {
    var res = new Tree('*'),
        d = derive(t.right);

    if(d.val === 1) return new Tree(t.left.val);
    if(TreePattern.eq(d.val, TreePattern.NUM)) return new Tree(t.left.val * d.val);

    res.l(t.left);
    res.r(d);

    return res;
}

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
            if(tree.right.right.val === 1) {
                tree.right = tree.right.left;
            }
            return chainRule(tree, tree.right);
        }
    };

    if(tree.equals(_schemas.powerRule.basic)) return fns.basic();
    else if(tree.equals(_schemas.powerRule.coefficent)) return fns.coefficent();
    else throw "[" + tree.toFlatString() + "]" + " Is not a power rule";

}

function productRule(t) {
    var res = new Tree("+"),
        left = new Tree("*"),
        right = new Tree("*");

    left.l(t.left);
    left.r(derive(t.right));

    right.l(t.right);
    right.r(derive(t.left));

    res.l(left);
    res.r(right);

    return res;
}

function quotientRule(t) {
    var res = new Tree('/'),
        num = new Tree('-'),
        denom = new Tree('^'),
        lo = t.left,
        hi = t.right,
        loDHi = new Tree("*"),
        hiDlo = new Tree("*");

    loDHi.l(lo);
    loDHi.r(derive(hi));

    hiDlo.l(hi);
    hiDlo.r(derive(lo));

    num.l(loDHi);
    num.r(hiDlo);

    denom.l(hi);
    denom.r(2);

    res.l(num);
    res.r(denom);

    return res;
}

function chainRule(org, innerFx) {
    if(innerFx.right) {
        var res = new Tree("*");
        var d = derive(innerFx);
        if(d.val != '1' &&
          ((d.val == '*' && d.right.val != '1') || d.val != '*')) {
            res.l(org);
            res.r(d);

            return res;
        }
    }

    return org;
}

function trigRules(t) {
    var tree = t.clone(),
        tRules = {
            'sin': parseInput('cos@@@'),
            'cos': parseInput('-1*sin@@@'),
            'tan': parseInput('(sec@@@)^2'),
            'csc': parseInput('-1*csc@@@*cot@@@'),
            'sec': parseInput('sec@@@*tan@@@'),
            'cot': parseInput('-1*(csc@@@)^2')
        };

    if(tRules[t.val]) {
        var res = tRules[t.val].clone();

        res.replace(TreePattern.MARKER, t.right);

        return chainRule(res, t.right);
    } else {
        throw 'not a trig rule';
    }
}


function logRule(t) {
    if(t.val == 'ln') {
        var res = new Tree('/');
        res.l('1');
        res.r(t.right);
        return chainRule(res, t.right);
    }
}
