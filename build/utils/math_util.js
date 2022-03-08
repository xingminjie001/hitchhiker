"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MathUtil {
    static distribute(total, cores) {
        const result = [];
        let distributed = 0;
        for (let i = 0; i < cores; i++) {
            const max = parseInt((total * (i + 1) / cores) + '');
            const current = i === 0 ? max : max - distributed;
            distributed += current;
            result.push(current);
        }
        return result;
    }
    static stddev(data) {
        if (!data || data.length === 0) {
            return 0;
        }
        var mean = data.reduce((p, c) => p + c, 0) / data.length;
        var deviations = data.map(x => x - mean);
        return Math.sqrt(deviations.map(x => x * x).reduce((p, c) => p + c, 0) / data.length);
    }
}
exports.MathUtil = MathUtil;
//# sourceMappingURL=math_util.js.map