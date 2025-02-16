# Web3D Playground ▶ Readme

> Personal Web3D experimentation and learning space.

## Setup

This playground requires a minimal setup without additional JavaScript local tools (no `node_modules`). The `index.html` file must be served under HTTP as some features will not work using the file protocol. Thus, a web server is needed.

The quickest way to run a web server is to install the `live-server` package globally and run it in the project root directory.

```
npm install -g live-server
live-server
```

There are other methods to install a web server. Here is a quick list of HTTP static server methods: [Big list of http static server one-liners](https://gist.github.com/willurd/5720255).

### No `package.json`? Why?

I love to code on the go, and I need portability. I use [Textastic](https://www.textasticapp.com/) code editor to run and test web 3D experiences from my iPhone and iPad. Therefore, no packaging and build tools are included in this setup, as it is challenging to get *Node.js* running correctly on iOS devices. Hence, all libraries are also loaded through CDN. Make sure you have a good and stable internet connection.

The best practice for delivering the app in a production environment is to use [Node.js](https://nodejs.org/) packaging and build tools (*WebPack* or *Vite*).
