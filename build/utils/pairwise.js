"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PairwiseStrategy {
    static GetTestCasesByObj(obj) {
        const keys = Object.keys(obj);
        const source = new Array();
        keys.forEach(k => {
            source.push(obj[k]);
        });
        const testCaseArr = new PairwiseStrategy().GetTestCases(source);
        const testCases = new Array();
        testCaseArr.forEach(t => {
            const testCase = {};
            testCases.push(testCase);
            t.forEach((l, i) => {
                testCase[keys[i]] = l;
            });
        });
        return testCases;
    }
    GetTestCases(sources) {
        let testCases = new Array();
        let valueSet = this.CreateValueSet(sources);
        let dimensions = this.CreateDimensions(valueSet);
        let pairwiseTestCases = new PairwiseTestCaseGenerator().GetTestCases(dimensions);
        for (let pairwiseTestCase of pairwiseTestCases) {
            let testData = new Array();
            for (let i = 0; i < pairwiseTestCase.Features.length; i++) {
                testData[i] = valueSet[i][pairwiseTestCase.Features[i]];
            }
            testCases.push(testData);
        }
        return testCases;
    }
    CreateValueSet(sources) {
        let valueSet = new Array(sources.length);
        for (let i = 0; i < valueSet.length; i++) {
            let values = new Array();
            for (let value of sources[i]) {
                values.push(value);
            }
            valueSet[i] = values;
        }
        return valueSet;
    }
    CreateDimensions(valueSet) {
        let dimensions = new Array();
        for (let i = 0; i < valueSet.length; i++) {
            dimensions[i] = valueSet[i].length;
        }
        return dimensions;
    }
}
exports.PairwiseStrategy = PairwiseStrategy;
class PairwiseTestCaseGenerator {
    GetTestCases(dimensions) {
        this._prng = new FleaRand(15485863);
        this._dimensions = dimensions;
        this.CreateAllTuples();
        const testCases = new Array();
        while (true) {
            let nextTuple = this.GetNextTuple();
            if (!nextTuple) {
                break;
            }
            let testCaseInfo = this.CreateTestCase(nextTuple);
            if (testCaseInfo) {
                this.RemoveTuplesCoveredByTest(testCaseInfo);
                testCases.push(testCaseInfo);
            }
        }
        return testCases;
    }
    GetNextRandomNumber() {
        return Math.abs(this._prng.Next() >> 1);
    }
    CreateAllTuples() {
        this._uncoveredTuples = new Array();
        for (let i = 0; i < this._dimensions.length; i++) {
            this._uncoveredTuples[i] = new Array(this._dimensions[i]);
            for (let j = 0; j < this._dimensions[i]; j++) {
                this._uncoveredTuples[i][j] = this.CreateTuples(i, j);
            }
        }
    }
    CreateTuples(dimension, feature) {
        let list = new Array();
        list.push(new FeatureTuple(new FeatureInfo(dimension, feature)));
        for (let i = 0; i < this._dimensions.length; i++) {
            if (i !== dimension) {
                for (let j = 0; j < this._dimensions[i]; j++) {
                    list.push(new FeatureTuple(new FeatureInfo(dimension, feature), new FeatureInfo(i, j)));
                }
            }
        }
        return list;
    }
    GetNextTuple() {
        for (let i = 0; i < this._uncoveredTuples.length; i++) {
            for (let j = 0; j < this._uncoveredTuples[i].length; j++) {
                let list = this._uncoveredTuples[i][j];
                if (list.length > 0) {
                    return list.shift();
                }
            }
        }
        return undefined;
    }
    CreateTestCase(tuple) {
        let bestTestCase;
        let bestCoverage = -1;
        for (let i = 0; i < 7; i++) {
            let testCaseInfo = this.CreateRandomTestCase(tuple);
            let coverage = this.MaximizeCoverage(testCaseInfo, tuple);
            if (coverage > bestCoverage) {
                bestTestCase = testCaseInfo;
                bestCoverage = coverage;
            }
        }
        return bestTestCase;
    }
    CreateRandomTestCase(tuple) {
        let testCaseInfo = new TestCaseInfo(this._dimensions.length);
        for (let i = 0; i < this._dimensions.length; i++) {
            const num = this.GetNextRandomNumber();
            testCaseInfo.Features[i] = num % this._dimensions[i];
        }
        for (let j = 0; j < tuple.Length; j++) {
            testCaseInfo.Features[tuple.get_Item(j).Dimension] = tuple.get_Item(j).Feature;
        }
        return testCaseInfo;
    }
    MaximizeCoverage(testCase, tuple) {
        let totalCoverage = 1;
        let mutableDimensions = this.GetMutableDimensions(tuple);
        while (true) {
            let progress = false;
            this.ScrambleDimensions(mutableDimensions);
            for (let i = 0; i < mutableDimensions.length; i++) {
                let d = mutableDimensions[i];
                let bestCoverage = this.CountTuplesCoveredByTest(testCase, d, testCase.Features[d]);
                let newCoverage = this.MaximizeCoverageForDimension(testCase, d, bestCoverage);
                totalCoverage = totalCoverage + newCoverage;
                if (newCoverage > bestCoverage) {
                    progress = true;
                }
            }
            if (!progress) {
                return totalCoverage;
            }
        }
    }
    GetMutableDimensions(tuple) {
        let list = new Array();
        let immutableDimensions = new Array(this._dimensions.length);
        for (let i = 0; i < tuple.Length; i++) {
            immutableDimensions[tuple.get_Item(i).Dimension] = true;
        }
        for (let j = 0; j < this._dimensions.length; j++) {
            if (!immutableDimensions[j]) {
                list.push(j);
            }
        }
        return list;
    }
    ScrambleDimensions(dimensions) {
        for (let i = 0; i < dimensions.length; i++) {
            let j = this.GetNextRandomNumber() % dimensions.length;
            let t = dimensions[i];
            dimensions[i] = dimensions[j];
            dimensions[j] = t;
        }
    }
    MaximizeCoverageForDimension(testCase, dimension, bestCoverage) {
        let bestFeatures = new Array();
        for (let i = 0; i < this._dimensions[dimension]; i++) {
            testCase.Features[dimension] = i;
            let coverage = this.CountTuplesCoveredByTest(testCase, dimension, i);
            if (coverage >= bestCoverage) {
                if (coverage > bestCoverage) {
                    bestCoverage = coverage;
                    bestFeatures = [];
                }
                bestFeatures.push(i);
            }
        }
        if (bestFeatures.length > 0) {
            testCase.Features[dimension] = bestFeatures[this.GetNextRandomNumber() % bestFeatures.length];
        }
        return bestCoverage;
    }
    CountTuplesCoveredByTest(testCase, dimension, feature) {
        let result = 0;
        let list = this._uncoveredTuples[dimension][feature];
        for (let i = 0; i < list.length; i++) {
            if (testCase.IsTupleCovered(list[i])) {
                result++;
            }
        }
        return result;
    }
    RemoveTuplesCoveredByTest(testCase) {
        for (let i = 0; i < this._uncoveredTuples.length; i++) {
            for (let j = 0; j < this._uncoveredTuples[i].length; j++) {
                let list = this._uncoveredTuples[i][j];
                for (let k = list.length - 1; k >= 0; k--) {
                    if (testCase.IsTupleCovered(list[k])) {
                        list.splice(k, 1);
                    }
                }
            }
        }
    }
}
class TestCaseInfo {
    constructor(length) {
        this.Features = new Array(length);
    }
    IsTupleCovered(tuple) {
        for (let i = 0; i < tuple.Length; i++) {
            if (this.Features[tuple.get_Item(i).Dimension] !== tuple.get_Item(i).Feature) {
                return false;
            }
        }
        return true;
    }
}
class FeatureTuple {
    get Length() {
        return this._features.length;
    }
    get_Item(index) {
        return this._features[index];
    }
    constructor(feature1, feature2) {
        if (arguments.length === 1 || !feature2) {
            this._features = [feature1];
            return;
        }
        this._features = [feature1, feature2];
    }
}
class FeatureInfo {
    constructor(dimension, feature) {
        this.Dimension = 0;
        this.Feature = 0;
        this.Dimension = dimension;
        this.Feature = feature;
    }
}
class FleaRand {
    constructor(seed) {
        this._b = 0;
        this._c = 0;
        this._d = 0;
        this._z = 0;
        this._m = new Array(256);
        this._r = new Array(256);
        this._q = 0;
        this._b = seed;
        this._c = seed;
        this._d = seed;
        this._z = seed;
        for (let i = 0; i < this._m.length; i++) {
            this._m[i] = seed;
        }
        for (let j = 0; j < 10; j++) {
            this.Batch();
        }
        this._q = 0;
    }
    Next() {
        if (this._q === 0) {
            this.Batch();
            this._q = this._r.length - 1;
        }
        else {
            this._q--;
        }
        return this._r[this._q];
    }
    Batch() {
        let a = 0;
        let b = this._b;
        let c = this._c + (++this._z);
        let d = this._d;
        for (let i = 0; i < this._r.length; i++) {
            a = this._m[b % this._m.length];
            this._m[b % this._m.length] = d;
            d = Math.abs((c << 19) + (c >> 13) + b);
            c = Math.abs(b ^ this._m[i]);
            b = a + d;
            this._r[i] = c;
        }
        this._b = b;
        this._c = c;
        this._d = d;
    }
}
//# sourceMappingURL=pairwise.js.map