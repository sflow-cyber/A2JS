module.exports = {
    launch: {
        args: ["--disable-web-security"]
    },
    server: [
        {
            command: "node node_modules/static-server/bin/static-server.js -p 4444 ../www",
            port: 4444
        },
        {
            command: "node mock-server/server.js 4445",
            port: 4445
        }
    ],
    browserContext: 'incognito',
    exitOnPageError: false
};
