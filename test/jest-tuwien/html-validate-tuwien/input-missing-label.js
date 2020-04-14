const { Rule, RuleDocumentation } = require("html-validate");

/* PATCHED to recognize aria-label and aria-labelledby attributes */
class InputMissingLabel extends Rule {
    documentation() {
        return {
            description: "Labels are associated with the input element and is required for a17y.",
            url: rule_1.ruleDocumentationUrl(__filename),
        };
    }
    setup() {
        this.on("dom:ready", (event) => {
            const root = event.document;
            for (const elem of root.querySelectorAll("input, textarea, select")) {
                /* <input type="hidden"> should not have label */
                if (elem.is("input")) {
                    const type = elem.getAttributeValue("type");
                    if (type && type.toLowerCase() === "hidden") {
                        continue;
                    }
                }
                /* try to find aria-label or aria-labelledby attributes */
                if (elem.hasAttribute("aria-label") || elem.hasAttribute("aria-labelledby")) {
                    continue;
                }
                /* elements that are aria-hidden do not need a label */
                if (elem.hasAttribute("aria-hidden")) {
                    const hidden = elem.getAttributeValue("aria-hidden");
                    if (hidden && hidden.toLowerCase() === "true") {
                        continue;
                    }
                }
                /* try to find label by id */
                if (findLabelById(root, elem.id)) {
                    continue;
                }
                /* try to find parent label (input nested in label) */
                if (findLabelByParent(elem)) {
                    continue;
                }
                this.report(elem, `<${elem.tagName}> element does not have a <label>`);
            }
        });
    }
}
function findLabelById(root, id) {
    if (!id)
        return null;
    return root.querySelector(`label[for="${id}"]`);
}
function findLabelByParent(el) {
    let cur = el.parent;
    while (cur) {
        if (cur.is("label")) {
            return cur;
        }
        cur = cur.parent;
    }
    return null;
}
module.exports = InputMissingLabel;
