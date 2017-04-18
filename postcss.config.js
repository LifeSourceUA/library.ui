const path = require('path');

module.exports = {
    plugins: [
        require('postcss-easy-import'),
        require('postcss-nested')(),
        require('postcss-url')({
            url: 'copy',
            assetsPath: 'static/assets',
            useHash: true
        })
    ]
};
