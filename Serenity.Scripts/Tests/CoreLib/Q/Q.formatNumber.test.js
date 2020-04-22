var $ = require("jQuery");
global.$ = global.jQuery = $;
require("SerenityCoreLib");

test('format number with "." as decimal separator', function() {
    Q.Culture.decimalSeparator = '.';
    Q.Culture.groupSeparator = ',';
    expect(Q.formatNumber(1234, '#,##0')).toBe('1,234');
    expect(Q.formatNumber(1234.5, '#,##0.##')).toBe('1,234.5');
    expect(Q.formatNumber(1234.5678, '#,##0.##')).toBe('1,234.57');
    expect(Q.formatNumber(1234.5, '#,##0.00')).toBe('1,234.50');
});

test('format number with "," as decimal separator', function() {
    Q.Culture.decimalSeparator = ',';
    Q.Culture.groupSeparator = '.';
    expect(Q.formatNumber(1, '0.00')).toBe('1,00');
    expect(Q.formatNumber(1, '0.0000')).toBe('1,0000');
    expect(Q.formatNumber(1234, '#,##0')).toBe('1.234');
    expect(Q.formatNumber(1234.5, '#,##0.##')).toBe('1.234,5');
    expect(Q.formatNumber(1234.5678, '#,##0.##')).toBe('1.234,57');
    expect(Q.formatNumber(1234.5, '#,##0.00')).toBe('1.234,50');
});