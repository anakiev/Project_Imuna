module.exports = {
    output: 'standalone',
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/v0/b/imuna-8567f.appspot.com/o/*',
        },
      ],
    },
  }