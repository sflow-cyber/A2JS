const { HtmlValidate } = require('html-validate');
require('html-validate/jest');
const path = require('path');

// adapted from html-validate/jest to return all validation errors as part of the message
function toBeValid2(report) {
    const pass = report.valid;
    let message = () => '';
    if (!pass) {
        message = () => {
            let msg = `HTML does not validate (${report.errorCount} errors, ${report.warningCount} warnings).\n`;
            for (const r of report.results) {
                for (const e of r.messages) {
                    const type = e.severity == 2 ? 'error' : 'warning';
                    msg += `[${type}] ${path.basename(r.filePath)}:${e.line}:${e.column}: ${e.message}\n`;
                }
            }
            return msg;
        };
    }
    return { pass, message }
}

expect.extend({ toBeValid2 });

function validateHtml(file, points = 0.5) {
    test(`has valid HTML // validate // ${points}`, () => {
        const htmlvalidate = new HtmlValidate({
            plugins: ["<rootDir>/jest-tuwien/html-validate-tuwien"],
            extends: ["html-validate:recommended"],
            rules: {
                "no-unknown-elements": "error",
                "missing-doctype": "error",
                "no-missing-references": "error",
                "no-trailing-whitespace": "warn",
                "tuwien/input-missing-label": "error"
            }
        });
        const report = htmlvalidate.validateFile(path.normalize(file));
        expect(report).toBeValid2();
    });
}

module.exports = { validateHtml }
