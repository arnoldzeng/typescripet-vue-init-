module.exports = {
    css: {
        loaderOptions: {
            postcss: {
                // options here will be passed to postcss-loader
            },
        },
    },
    devServer: {
        port: 8083,
        https: true,
    },
};
