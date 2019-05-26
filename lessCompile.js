const less = require("less");
function lessCompile(lessinput, options) {
    return new Promise((resolve, reject) => {
        less.render(lessinput, options, (error, output) => {
            if (error) {
                reject({ code: false, data: "" });
                return;
            } else {
                resolve({ code: true, data: output.css });
                return;
            }
        });
    });
}
module.exports = lessCompile;
