const path = require('path');

module.exports = {
    webpack: (config, { dev }) => {
        config.module.rules.push(
            {
                test: /\.css/,
                use: [
                    {
                        loader: 'emit-file-loader',
                        options: {
                            name: 'dist/[path][name].[ext]'
                        }
                    },
                    'babel-loader',
                    'raw-loader',
                    'postcss-loader'
                ]
            }
        );

        return config;
    }
};
